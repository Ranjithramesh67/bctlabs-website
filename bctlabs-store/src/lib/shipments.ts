import "server-only";

import type { bctlabs_shipments } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { setOrderMeta, updateOrderStatus } from "./orders";
import { mapTrackingStatus, type PaymentType, type ShipmentStatus } from "./nimbuspost";

export type Shipment = {
  id: number;
  orderId: number;
  awbNumber: string | null;
  courierId: string | null;
  courierName: string | null;
  status: ShipmentStatus;
  statusCode: string | null;
  statusUpdatedAt: Date | null;
  freightAmount: number | null;
  codAmount: number | null;
  paymentType: PaymentType;
  weightGrams: number | null;
  manifestUrl: string | null;
  labelUrl: string | null;
  originWarehouse: string | null;
  originPincode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function hydrate(row: bctlabs_shipments): Shipment {
  return {
    id: Number(row.id),
    orderId: Number(row.order_id),
    awbNumber: row.awb_number,
    courierId: row.courier_id,
    courierName: row.courier_name,
    status: row.status as ShipmentStatus,
    statusCode: row.status_code,
    statusUpdatedAt: row.status_updated_at,
    freightAmount: row.freight_amount === null ? null : Number(row.freight_amount),
    codAmount: row.cod_amount === null ? null : Number(row.cod_amount),
    paymentType: row.payment_type as PaymentType,
    weightGrams: row.weight_grams,
    manifestUrl: row.manifest_url,
    labelUrl: row.label_url,
    originWarehouse: row.origin_warehouse,
    originPincode: row.origin_pincode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getShipmentForOrder(orderId: number): Promise<Shipment | null> {
  const row = await prisma.bctlabs_shipments.findUnique({ where: { order_id: BigInt(orderId) } });
  return row ? hydrate(row) : null;
}

export async function getShipmentByAwb(awbNumber: string): Promise<Shipment | null> {
  const row = await prisma.bctlabs_shipments.findUnique({ where: { awb_number: awbNumber } });
  return row ? hydrate(row) : null;
}

export async function getShipments(opts: { limit?: number; status?: ShipmentStatus } = {}): Promise<Shipment[]> {
  const rows = await prisma.bctlabs_shipments.findMany({
    where: opts.status ? { status: opts.status } : undefined,
    orderBy: { created_at: "desc" },
    take: opts.limit ?? 100,
  });
  return rows.map(hydrate);
}

export type ShipmentInput = {
  orderId: number;
  awbNumber: string;
  courierId?: string | null;
  courierName?: string | null;
  shipmentId?: string | null;
  freightAmount?: number | null;
  codAmount?: number | null;
  paymentType: PaymentType;
  weightGrams: number;
  labelUrl?: string | null;
  originWarehouse?: string | null;
  originPincode?: string | null;
};

/**
 * Persist a booked shipment. Re-booking the same order replaces the AWB but
 * keeps a single row, so lookups by order id always return the live shipment.
 */
export async function saveShipment(input: ShipmentInput): Promise<Shipment> {
  const existing = await prisma.bctlabs_shipments.findUnique({ where: { order_id: BigInt(input.orderId) } });
  const data = {
    awb_number: input.awbNumber,
    courier_id: input.courierId ?? null,
    courier_name: input.courierName ?? null,
    nimbuspost_shipment_id: input.shipmentId ?? null,
    freight_amount: input.freightAmount ?? null,
    cod_amount: input.codAmount ?? null,
    payment_type: input.paymentType,
    weight_grams: input.weightGrams,
    label_url: input.labelUrl ?? null,
    origin_warehouse: input.originWarehouse ?? null,
    origin_pincode: input.originPincode ?? null,
    status: "CREATED" as ShipmentStatus,
    status_code: null,
    status_updated_at: null,
  };
  const row = existing
    ? await prisma.bctlabs_shipments.update({ where: { id: existing.id }, data })
    : await prisma.bctlabs_shipments.create({ data: { order_id: BigInt(input.orderId), ...data } });

  // Mirror onto order meta so the WooCommerce admin (and exports) see the AWB.
  await Promise.all([
    setOrderMeta(input.orderId, "_nimbuspost_awb", input.awbNumber),
    setOrderMeta(input.orderId, "_nimbuspost_courier", input.courierName ?? ""),
    setOrderMeta(input.orderId, "_tracking_number", input.awbNumber),
    setOrderMeta(input.orderId, "_tracking_provider", input.courierName ?? "NimbusPost"),
    ...(input.labelUrl ? [setOrderMeta(input.orderId, "_shipping_label_url", input.labelUrl)] : []),
    ...(input.originWarehouse ? [setOrderMeta(input.orderId, "_origin_warehouse", input.originWarehouse)] : []),
  ]);

  return hydrate(row);
}

export async function saveManifest(
  courierName: string,
  awbNumbers: string[],
  pdfUrl: string | null,
): Promise<{ id: number }> {
  const row = await prisma.bctlabs_manifests.create({
    data: { courier_name: courierName, awb_numbers: awbNumbers, pdf_url: pdfUrl },
  });
  if (pdfUrl) {
    await prisma.bctlabs_shipments.updateMany({
      where: { awb_number: { in: awbNumbers } },
      data: { manifest_url: pdfUrl, manifest_generated_at: new Date() },
    });
  }
  return { id: Number(row.id) };
}

/** Chronological tracking timeline for a shipment (oldest first). */
export async function getShipmentTimeline(shipmentId: number) {
  const rows = await prisma.bctlabs_shipment_events.findMany({
    where: { shipment_id: BigInt(shipmentId) },
    orderBy: [{ occurred_at: "asc" }, { id: "asc" }],
  });
  return rows.map((row) => ({
    id: Number(row.id),
    status: row.status as ShipmentStatus,
    statusCode: row.status_code,
    rawStatus: row.raw_status,
    occurredAt: row.occurred_at,
  }));
}

export type PendingShipment = Shipment & {
  orderTotal: number | null;
  customerName: string;
  customerEmail: string;
};

/**
 * Shipments that still need a courier handover, grouped by courier for the
 * admin daily-manifest screen. Manifested shipments are excluded.
 */
export async function getPendingShipmentsByCourier(): Promise<Record<string, PendingShipment[]>> {
  const rows = await prisma.bctlabs_shipments.findMany({
    where: {
      manifest_generated_at: null,
      status: { in: ["CREATED", "PICKUP_SCHEDULED"] },
      awb_number: { not: null },
    },
    orderBy: { created_at: "asc" },
  });
  if (!rows.length) return {};

  const orders = await prisma.wp_wc_orders.findMany({
    where: { id: { in: rows.map((row) => row.order_id) } },
    select: { id: true, total_amount: true, billing_email: true },
  });
  const byId = new Map(orders.map((order) => [String(order.id), order]));
  const addresses = await prisma.wp_wc_order_addresses.findMany({
    where: { order_id: { in: rows.map((row) => row.order_id) }, address_type: "billing" },
    select: { order_id: true, first_name: true, last_name: true },
  });
  const nameById = new Map(
    addresses.map((address) => [
      String(address.order_id),
      `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim(),
    ]),
  );

  const grouped: Record<string, PendingShipment[]> = {};
  for (const row of rows) {
    const shipment = hydrate(row);
    const order = byId.get(String(row.order_id));
    const courier = shipment.courierName || "Unassigned";
    grouped[courier] ??= [];
    grouped[courier].push({
      ...shipment,
      orderTotal: order ? Number(order.total_amount ?? 0) : null,
      customerName: nameById.get(String(row.order_id)) ?? "",
      customerEmail: order?.billing_email ?? "",
    });
  }
  return grouped;
}

/** Order statuses a shipment state is allowed to push the order into. */
function orderStatusFor(status: ShipmentStatus): string | null {
  if (status === "DELIVERED") return "completed";
  if (status === "CANCELLED" || status === "RTO_DELIVERED") return "cancelled";
  return null;
}

export type TrackingUpdate = {
  awbNumber?: string | null;
  orderId?: number | null;
  statusCode?: string | null;
  statusText?: string | null;
  eventAt?: Date | null;
};

/**
 * Apply a tracking update idempotently. Older events (e.g. a delayed webhook)
 * never overwrite a newer state, and duplicate deliveries are a no-op; both
 * return null so the caller can report them as ignored.
 */
export async function applyTrackingUpdate(update: TrackingUpdate): Promise<Shipment | null> {
  const shipment = update.awbNumber
    ? await getShipmentByAwb(update.awbNumber)
    : update.orderId
      ? await getShipmentForOrder(update.orderId)
      : null;
  if (!shipment) return null;

  const status = mapTrackingStatus(update.statusCode || update.statusText);
  const eventAt = update.eventAt ?? new Date();
  if (shipment.statusUpdatedAt && eventAt < shipment.statusUpdatedAt) return null;
  if (shipment.status === status && shipment.statusCode === (update.statusCode ?? null)) return null;

  const row = await prisma.bctlabs_shipments.update({
    where: { id: BigInt(shipment.id) },
    data: {
      status,
      status_code: update.statusCode ?? null,
      status_updated_at: eventAt,
    },
  });

  // Append-only timeline; the unique index makes a retried event a no-op.
  await prisma.bctlabs_shipment_events
    .create({
      data: {
        shipment_id: BigInt(shipment.id),
        status,
        status_code: update.statusCode ?? null,
        raw_status: update.statusText ?? null,
        occurred_at: eventAt,
      },
    })
    .catch(() => undefined);

  const nextOrderStatus = orderStatusFor(status);
  if (nextOrderStatus) {
    await updateOrderStatus(shipment.orderId, nextOrderStatus).catch((error) => {
      console.error(`Failed to sync order ${shipment.orderId} status`, error);
    });
  }

  await setOrderMeta(shipment.orderId, "_nimbuspost_status", status).catch(() => undefined);
  return hydrate(row);
}
