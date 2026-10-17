import { NextResponse } from "next/server";
import { z } from "zod";
import { findOrderForTracking, type Order } from "@/lib/orders";
import { getShipmentForOrder } from "@/lib/shipments";

export type TrackedOrder = {
  id: number;
  status: string;
  currency: string;
  dateCreated: string | null;
  paymentTitle: string;
  billingEmail: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: number;
    productId: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone?: string;
  } | null;
  shipment: {
    awbNumber: string | null;
    courierName: string | null;
    status: string;
    statusUpdatedAt: string | null;
  } | null;
};

const bodySchema = z.object({
  orderId: z.coerce.number().int().positive(),
  email: z.email(),
});

// Never expose the order key or anything beyond what the customer needs to see.
type ShipmentSummary = {
  awbNumber: string | null;
  courierName: string | null;
  status: string;
  statusUpdatedAt: Date | null;
} | null;

function serialize(order: Order, shipment: ShipmentSummary): TrackedOrder {
  return {
    id: order.id,
    status: order.status,
    currency: order.currency,
    dateCreated: order.dateCreated ? order.dateCreated.toISOString() : null,
    paymentTitle: order.paymentTitle,
    billingEmail: order.billingEmail,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      productId: item.productId,
    })),
    shippingAddress: order.shippingAddress,
    shipment: shipment
      ? {
          awbNumber: shipment.awbNumber,
          courierName: shipment.courierName,
          status: shipment.status,
          statusUpdatedAt: shipment.statusUpdatedAt ? shipment.statusUpdatedAt.toISOString() : null,
        }
      : null,
  };
}

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid order number and email address." },
      { status: 422 },
    );
  }

  const { orderId, email } = parsed.data;

  try {
    const order = await findOrderForTracking(orderId, email.trim());
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    const shipment = await getShipmentForOrder(order.id);
    return NextResponse.json(serialize(order, shipment));
  } catch (error) {
    console.error("Failed to look up order", error);
    return NextResponse.json(
      { error: "We could not look up your order. Please try again." },
      { status: 500 },
    );
  }
}
