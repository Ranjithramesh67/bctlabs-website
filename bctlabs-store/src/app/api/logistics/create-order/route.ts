import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession, isStaffUser } from "@/lib/admin-auth";
import {
  NimbusPostApiError,
  checkServiceability,
  cheapestOption,
  createShipment,
  defaultWarehouse,
  defaultItemWeightGrams,
  isNimbusPostConfigured,
  originPincode,
  warehouse,
  type AddressPayload,
  type PaymentType,
} from "@/lib/nimbuspost";
import { getOrderById } from "@/lib/orders";
import { getShipmentForOrder, saveShipment } from "@/lib/shipments";
import { BRAND } from "@/lib/site-content";

const addressSchema = z.object({
  name: z.string().trim().min(1),
  address1: z.string().trim().min(1),
  address2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  pincode: z.string().trim().regex(/^\d{6}$/),
  phone: z.string().trim().min(6),
  email: z.string().trim().optional().default(""),
});

const bodySchema = z.object({
  order_id: z.coerce.number().int().positive(),
  payment_type: z.enum(["COD", "PREPAID", "Prepaid", "cod", "prepaid"]).optional(),
  weight: z.coerce.number().int().positive().max(50000).optional(),
  shipping: addressSchema.optional(),
  courier_id: z.string().trim().min(1).optional(),
  // Optional SKU list from the picking sheet; used only to derive parcel weight.
  items: z
    .array(z.object({ sku: z.string().trim().optional(), quantity: z.coerce.number().int().positive() }))
    .optional(),
});

function pickupAddress(): AddressPayload {
  return {
    name: process.env.NIMBUSPOST_PICKUP_NAME || BRAND.name,
    address: process.env.NIMBUSPOST_PICKUP_ADDRESS || BRAND.address.line1,
    address2: process.env.NIMBUSPOST_PICKUP_ADDRESS_2 || BRAND.address.line2,
    city: process.env.NIMBUSPOST_PICKUP_CITY || BRAND.address.city,
    state: process.env.NIMBUSPOST_PICKUP_STATE || BRAND.address.state,
    pincode: originPincode(),
    phone: process.env.NIMBUSPOST_PICKUP_PHONE || BRAND.phone.replace(/\s+/g, ""),
    email: process.env.NIMBUSPOST_PICKUP_EMAIL || BRAND.email,
  };
}

function toAddressPayload(address: z.infer<typeof addressSchema>): AddressPayload {
  return {
    name: address.name,
    address: address.address1,
    address2: address.address2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    phone: address.phone,
    email: address.email || undefined,
  };
}

/**
 * Book a NimbusPost shipment for an existing order.
 *
 * Staff-only: creating a shipment is a billable action, so it must never be
 * reachable from the public storefront. The courier is the cheapest one the
 * live serviceability API offers for the destination pincode.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.userId || !(await isStaffUser(session.userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isNimbusPostConfigured()) {
    return NextResponse.json({ error: "NimbusPost is not configured." }, { status: 503 });
  }

  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 422 });
  }

  const { order_id, weight, shipping, courier_id, items } = parsed.data;
  const order = await getOrderById(order_id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (["cancelled", "refunded", "failed", "wc-cancelled", "wc-refunded", "wc-failed"].includes(order.status)) {
    return NextResponse.json({ error: "This order cannot be shipped." }, { status: 400 });
  }

  const existing = await getShipmentForOrder(order_id);
  if (existing?.awbNumber && !request.headers.get("x-rebook")) {
    return NextResponse.json(
      { error: "This order already has a shipment.", shipment: existing },
      { status: 409 },
    );
  }

  const paymentType: PaymentType =
    (parsed.data.payment_type?.toUpperCase() as PaymentType | undefined) ??
    (order.paymentMethod === "cod" ? "COD" : "PREPAID");

  // Customers never enter a weight, and WooCommerce products here mostly lack
  // one, so fall back to a configurable per-line default.
  const computedWeight =
    weight ??
    Math.max(
      1,
      items?.length
        ? items.reduce((sum, item) => sum + item.quantity * defaultItemWeightGrams(), 0)
        : order.items.reduce((sum, item) => sum + item.quantity * defaultItemWeightGrams(), 0),
    );

  let consignee: AddressPayload;
  if (shipping) {
    consignee = toAddressPayload(shipping);
  } else {
    const source = order.shippingAddress ?? order.billing;
    if (!source) {
      return NextResponse.json({ error: "This order has no delivery address." }, { status: 400 });
    }
    consignee = {
      name: `${source.firstName} ${source.lastName}`.trim(),
      address: source.address1,
      address2: source.address2,
      city: source.city,
      state: source.state,
      pincode: source.postcode,
      phone: source.phone || order.billing?.phone || "",
      email: source.email || order.billingEmail,
    };
  }
  if (!consignee.phone) {
    return NextResponse.json({ error: "A phone number is required for the shipment." }, { status: 400 });
  }

  try {
    const options = await checkServiceability({
      destinationPincode: consignee.pincode,
      weightGrams: computedWeight,
      paymentType,
      codAmount: paymentType === "COD" ? order.total : 0,
    });
    if (!options.length) {
      return NextResponse.json(
        { error: `No courier serves pincode ${consignee.pincode}.`, carriers: [] },
        { status: 400 },
      );
    }
    const chosen = courier_id
      ? options.find((option) => option.courierId === courier_id)
      : cheapestOption(options);
    if (!chosen) {
      return NextResponse.json({ error: "The selected courier does not serve this pincode." }, { status: 400 });
    }

    const shipment = await createShipment({
      orderNumber: String(order.id),
      paymentType,
      orderAmount: order.total,
      codAmount: paymentType === "COD" ? order.total : 0,
      weightGrams: computedWeight,
      consignee,
      courierId: courier_id ?? chosen.courierId,
      warehouseId: warehouse(defaultWarehouse()).warehouseId,
      warehouseName: process.env.NIMBUSPOST_PICKUP_NAME || BRAND.name,
      warehouseAddress: pickupAddress(),
    });

    const saved = await saveShipment({
      orderId: order.id,
      awbNumber: shipment.awbNumber,
      courierId: shipment.courierId ?? chosen.courierId,
      courierName: shipment.courierName || chosen.courierName,
      shipmentId: shipment.shipmentId,
      freightAmount: shipment.freight ?? chosen.freight,
      codAmount: paymentType === "COD" ? order.total : 0,
      paymentType,
      weightGrams: computedWeight,
    });

    return NextResponse.json({
      ok: true,
      awb_number: saved.awbNumber,
      courier_name: saved.courierName,
      shipment: saved,
    });
  } catch (error) {
    if (error instanceof NimbusPostApiError) {
      console.error("NimbusPost create shipment failed", error.statusCode, error.details);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode >= 500 ? 502 : error.statusCode },
      );
    }
    console.error("Unexpected shipment error", error);
    return NextResponse.json({ error: "Could not create the shipment." }, { status: 500 });
  }
}
