import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { applyTrackingUpdate } from "@/lib/shipments";

type TrackingEvent = {
  awbNumber: string | null;
  orderNumber: string | null;
  statusCode: string | null;
  statusText: string | null;
  eventAt: Date | null;
};

function firstString(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * NimbusPost tracking webhooks have shipped with a few field spellings. Read
 * the known aliases rather than pinning one exact schema, and accept either a
 * single object or a batch of events.
 */
function parseEvents(payload: unknown): TrackingEvent[] {
  const rows: Record<string, unknown>[] = [];
  const visit = (value: unknown, depth = 0) => {
    if (depth > 4 || !value) return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    if (typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (
      record.awb ||
      record.awb_number ||
      record.awbNumber ||
      record.status ||
      record.status_code ||
      record.current_status
    ) {
      rows.push(record);
      return;
    }
    for (const key of ["data", "payload", "shipment", "tracking", "updates", "events", "result"]) {
      if (record[key]) visit(record[key], depth + 1);
    }
  };
  visit(payload);

  return rows.map((row) => ({
    awbNumber: firstString(row, ["awb", "awb_number", "awbNumber", "tracking_number"]),
    orderNumber: firstString(row, ["order_number", "order_id", "orderNumber", "reference"]),
    statusCode: firstString(row, ["status_code", "statusCode", "code", "current_status_code"]),
    statusText: firstString(row, ["status", "current_status", "status_name", "statusName", "message"]),
    eventAt: toDate(row.timestamp ?? row.updated_at ?? row.event_time ?? row.date ?? row.created_at),
  }));
}

function secretMatches(provided: string | null): boolean {
  const expected = process.env.NIMBUSPOST_WEBHOOK_SECRET;
  if (!expected) return false;
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Unprotected tracking webhook (authenticated by a shared secret when one is
 * configured). Updates the shipment state and advances the order to completed
 * once delivered. Unknown AWBs are acknowledged so NimbusPost stops retrying
 * events that do not concern this store.
 */
export async function POST(request: Request) {
  // Fail closed: without a configured secret anyone could rewrite shipments.
  if (!process.env.NIMBUSPOST_WEBHOOK_SECRET) {
    console.error("NIMBUSPOST_WEBHOOK_SECRET is not set; rejecting tracking webhook");
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const providedSecret =
    request.headers.get("x-nimbuspost-secret") ??
    request.headers.get("x-webhook-secret") ??
    url.searchParams.get("secret");
  if (!secretMatches(providedSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const rawBody = await request.text();
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const events = parseEvents(payload);
  if (!events.length) {
    return NextResponse.json({ ok: true, ignored: true, reason: "No tracking events found." });
  }

  let updated = 0;
  let ignored = 0;
  try {
    for (const event of events) {
      const orderId = event.orderNumber ? Number(event.orderNumber) : NaN;
      const shipment =
        (event.awbNumber ? await applyTrackingUpdate(event) : null) ??
        (Number.isInteger(orderId) && orderId > 0
          ? await applyTrackingUpdate({ ...event, awbNumber: null, orderId })
          : null);
      if (shipment) updated += 1;
      else ignored += 1;
    }
  } catch (error) {
    console.error("NimbusPost webhook failed", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updated, ignored });
}
