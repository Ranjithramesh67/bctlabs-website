import "server-only";

import {
  NimbusPostApiError,
  checkServiceability,
  cheapestOption,
  createShipment,
  defaultItemWeightGrams,
  defaultWarehouse,
  isNimbusPostConfigured,
  isWarehouseCode,
  originPincode,
  warehouse,
  type AddressPayload,
  type PaymentType,
  type WarehouseCode,
} from "./nimbuspost";
import { getOrderById, getOrderMeta, type Order } from "./orders";
import { getShipmentForOrder, saveShipment, type Shipment } from "./shipments";

export type FulfillmentResult =
  | { status: "created"; shipment: Shipment }
  | { status: "exists"; shipment: Shipment }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

function parcelWeight(order: Order): number {
  return Math.max(
    1,
    order.items.reduce((sum, item) => sum + item.quantity * defaultItemWeightGrams(), 0),
  );
}

function consigneeFrom(order: Order): AddressPayload | null {
  const source = order.shippingAddress ?? order.billing;
  if (!source) return null;
  const phone = source.phone || order.billing?.phone || "";
  if (!phone) return null;
  return {
    name: `${source.firstName} ${source.lastName}`.trim(),
    address: source.address1,
    address2: source.address2,
    city: source.city,
    state: source.state,
    pincode: source.postcode,
    phone,
    email: source.email || order.billingEmail,
  };
}

async function resolveWarehouse(orderId: number, requested?: WarehouseCode): Promise<WarehouseCode> {
  if (requested) return requested;
  const meta = await getOrderMeta(orderId, "_origin_warehouse").catch(() => null);
  return isWarehouseCode(meta) ? meta : defaultWarehouse();
}

/**
 * Fulfilment worker: book the cheapest courier for a paid order.
 *
 * Safe to call more than once - an existing shipment short-circuits, and
 * failures are reported instead of thrown so a courier outage can never roll
 * back a confirmed payment.
 */
export async function createShippingOrder(
  orderId: number,
  options: { warehouse?: WarehouseCode; weightGrams?: number; courierId?: number } = {},
): Promise<FulfillmentResult> {
  if (!isNimbusPostConfigured()) {
    return { status: "skipped", reason: "NimbusPost is not configured." };
  }

  const existing = await getShipmentForOrder(orderId);
  if (existing?.awbNumber) return { status: "exists", shipment: existing };

  const order = await getOrderById(orderId);
  if (!order) return { status: "failed", reason: "Order not found." };
  if (["cancelled", "refunded", "failed", "wc-cancelled", "wc-refunded", "wc-failed"].includes(order.status)) {
    return { status: "failed", reason: "This order cannot be shipped." };
  }

  const consignee = consigneeFrom(order);
  if (!consignee) return { status: "failed", reason: "The order has no usable delivery address." };

  const warehouseCode = await resolveWarehouse(orderId, options.warehouse);
  const origin = originPincode(warehouseCode);
  if (!origin) {
    return { status: "skipped", reason: `No origin pincode configured for warehouse ${warehouseCode}.` };
  }

  const weightGrams = options.weightGrams ?? parcelWeight(order);
  const paymentType: PaymentType = order.paymentMethod === "cod" ? "COD" : "PREPAID";

  try {
    const rates = await checkServiceability({
      destinationPincode: consignee.pincode,
      weightGrams,
      paymentType,
      codAmount: paymentType === "COD" ? order.total : 0,
      originWarehouse: warehouseCode,
    });
    if (!rates.length) {
      return { status: "failed", reason: `Pincode ${consignee.pincode} is not serviceable.` };
    }
    const chosen = options.courierId
      ? rates.find((rate) => rate.courierId === options.courierId) ?? cheapestOption(rates)
      : cheapestOption(rates);
    if (!chosen) return { status: "failed", reason: "No courier available for this route." };

    const pickup = warehouse(warehouseCode);
    const booked = await createShipment({
      orderNumber: String(order.id),
      paymentType,
      orderAmount: order.total,
      codAmount: paymentType === "COD" ? order.total : 0,
      weightGrams,
      consignee,
      courierId: options.courierId ?? chosen.courierId,
      warehouseName: pickup.name,
      warehouseAddress: pickup,
    });

    const shipment = await saveShipment({
      orderId: order.id,
      awbNumber: booked.awbNumber,
      courierId: booked.courierId ?? chosen.courierId,
      courierName: booked.courierName || chosen.courierName,
      shipmentId: booked.shipmentId,
      freightAmount: booked.freight ?? chosen.freight,
      codAmount: paymentType === "COD" ? order.total : 0,
      paymentType,
      weightGrams,
      labelUrl: booked.labelUrl,
      originWarehouse: warehouseCode,
      originPincode: origin,
    });
    return { status: "created", shipment };
  } catch (error) {
    const reason =
      error instanceof NimbusPostApiError ? error.message : "Unexpected NimbusPost error.";
    console.error(`Fulfilment failed for order ${orderId}`, error);
    return { status: "failed", reason };
  }
}

/** Fire-and-forget wrapper used by payment handlers. */
export async function triggerFulfillment(orderId: number): Promise<void> {
  const result = await createShippingOrder(orderId);
  if (result.status === "failed") {
    console.error(`Auto-fulfilment skipped for order ${orderId}: ${result.reason}`);
  }
}
