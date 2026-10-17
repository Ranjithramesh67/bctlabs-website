import "server-only";

import { getOrderById } from "./orders";
import { confirmOrderPayment, recordPaymentEvent } from "./payments";
import { verifyWebhookSignature } from "./cashfree";

type CashfreeWebhookPayload = {
  type?: string;
  data?: {
    order?: { order_id?: string; order_amount?: number };
    payment?: {
      cf_payment_id?: number | string;
      payment_status?: string;
      payment_amount?: number;
      payment_method?: string | Record<string, unknown>;
    };
  };
};

function paymentMethodLabel(method: unknown): string {
  if (typeof method === "string" && method.trim()) return method.trim().toLowerCase();
  if (method && typeof method === "object") {
    const first = Object.keys(method as Record<string, unknown>)[0];
    if (first) return first.toLowerCase();
  }
  return "cashfree";
}

/**
 * Shared Cashfree webhook handler used by both webhook paths.
 *
 * The raw request body is read before any JSON parsing so the HMAC is
 * computed over exactly the bytes Cashfree signed. Order status is only
 * changed after the signature, the order linkage and the amount are verified.
 */
export async function handleCashfreeWebhook(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature") ?? "";
  const timestamp = request.headers.get("x-webhook-timestamp") ?? "";

  if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: CashfreeWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as CashfreeWebhookPayload;
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cfOrderId = payload.data?.order?.order_id ?? "";
  const orderId = /^bct-(\d+)/.exec(cfOrderId)?.[1];
  if (!orderId) {
    // Not an order this store owns; acknowledge so Cashfree stops retrying.
    return Response.json({ ok: true, ignored: true });
  }

  const order = await getOrderById(Number(orderId));
  if (!order) {
    return Response.json({ ok: true, ignored: true, reason: "Unknown order" });
  }

  const payment = payload.data?.payment;
  const eventType = payload.type ?? "PAYMENT_WEBHOOK";
  const paymentStatus = payment?.payment_status ?? "";
  const eventKey = `cashfree:${eventType}:${payment?.cf_payment_id ?? cfOrderId}`;
  const baseEvent = {
    eventKey,
    orderId: order.id,
    provider: "cashfree",
    eventType,
    cfOrderId,
    cfPaymentId: payment?.cf_payment_id ? String(payment.cf_payment_id) : null,
    amount: payment?.payment_amount ?? payload.data?.order?.order_amount ?? null,
    payload,
  };

  const success = eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS";
  if (!success) {
    const { duplicate } = await recordPaymentEvent(baseEvent);
    return Response.json({ ok: true, status: "ignored", duplicate, order_id: order.id });
  }

  // Zero trust in webhook amounts: they must agree with the stored order.
  const paidAmount = Number(payment?.payment_amount ?? payload.data?.order?.order_amount ?? 0);
  if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.total) > 0.01) {
    console.error(
      `Cashfree webhook amount mismatch for order ${order.id}: paid ${paidAmount}, expected ${order.total}`,
    );
    return Response.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const result = await confirmOrderPayment({
    ...baseEvent,
    transactionId: String(payment?.cf_payment_id ?? ""),
    paymentMethod: `cashfree_${paymentMethodLabel(payment?.payment_method)}`,
    paymentTitle: "Cashfree (online payment)",
  });

  return Response.json({ ok: true, status: result.status, order_id: result.orderId });
}
