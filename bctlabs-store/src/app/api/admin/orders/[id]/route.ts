import { NextResponse } from "next/server";

import { getAdminSession, isStaffUser } from "@/lib/admin-auth";
import { getOrderById, updateOrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "on-hold",
  "completed",
  "cancelled",
  "refunded",
  "failed",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

type RouteContext = { params: Promise<{ id: string }> };

function parseOrderId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.userId || !(await isStaffUser(session.userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseOrderId(id);
  if (orderId === null) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    // Serialize for the wire: `dateCreated` is the only Date on the order.
    return NextResponse.json({
      ...order,
      dateCreated: order.dateCreated ? order.dateCreated.toISOString() : null,
    });
  } catch (error) {
    console.error("Failed to load order", error);
    return NextResponse.json({ error: "Unable to load order" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.userId || !(await isStaffUser(session.userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseOrderId(id);
  if (orderId === null) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status = body && typeof body === "object" ? (body as { status?: unknown }).status : undefined;
  if (typeof status !== "string" || !ORDER_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }

  try {
    await updateOrderStatus(orderId, status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update order status", error);
    return NextResponse.json({ error: "Unable to update order status" }, { status: 500 });
  }
}
