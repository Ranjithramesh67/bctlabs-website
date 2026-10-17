import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession, isStaffUser } from "@/lib/admin-auth";
import { createCashfreeOrder, getCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";
import { getOrderById, getOrderMeta, setOrderMeta } from "@/lib/orders";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  order_id: z.coerce.number().int().positive(),
  // Optional: the client may echo the total, but the DB value always wins.
  amount: z.coerce.number().positive().optional(),
  // Guests created the order with a key; it authorises the session request.
  key: z.string().trim().optional(),
  customer_details: z
    .object({
      id: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      email: z.string().trim().optional(),
    })
    .optional(),
});

/**
 * Create (or reuse) a Cashfree payment session for an existing order.
 *
 * The caller must own the order: either a matching customer session, staff
 * access, or the order key issued at checkout. The amount is read from the
 * database and never trusted from the request.
 */
export async function POST(request: Request) {
  if (!isCashfreeConfigured()) {
    return NextResponse.json({ error: "Online payment is not available right now." }, { status: 503 });
  }

  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 422 });
  }

  const { order_id, key, amount, customer_details } = parsed.data;
  const order = await getOrderById(order_id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const [session, admin] = await Promise.all([getSession(), getAdminSession()]);
  const staff = admin.userId ? await isStaffUser(admin.userId) : false;
  const ownsOrder = Boolean(session.customerId) && session.customerId === order.customerId;
  if (!staff && !ownsOrder && !(key && key === order.orderKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (["cancelled", "refunded", "failed", "wc-cancelled", "wc-refunded", "wc-failed"].includes(order.status)) {
    return NextResponse.json({ error: "This order cannot be paid." }, { status: 400 });
  }
  if (order.transactionId && !["pending", "on-hold", "failed"].includes(order.status)) {
    return NextResponse.json({ error: "This order is already paid.", order_id: order.id, status: order.status }, { status: 409 });
  }
  if (amount !== undefined && Math.abs(amount - order.total) > 0.01) {
    return NextResponse.json({ error: "Payment amount does not match the order total." }, { status: 422 });
  }

  try {
    const cfOrderId = `bct-${order.id}`;
    const storedCfOrderId = await getOrderMeta(order.id, "_cashfree_order_id");

    // Reuse a live session so repeated clicks do not create duplicate orders.
    if (storedCfOrderId) {
      const existing = await getCashfreeOrder(storedCfOrderId);
      if (existing?.payment_session_id && existing.order_status !== "PAID") {
        return NextResponse.json({
          payment_session_id: existing.payment_session_id,
          order_id: order.id,
          cf_order_id: String(existing.cf_order_id),
          amount: order.total,
          mode: paymentMode(),
          reused: true,
        });
      }
    }

    const appUrl = (process.env.APP_URL ?? new URL(request.url).origin).replace(/\/+$/, "");
    const created = await createCashfreeOrder({
      orderId: cfOrderId,
      amount: order.total,
      customerId: customer_details?.id || (order.customerId ? `cust-${order.customerId}` : `guest-${order.billingEmail}`),
      customerEmail: customer_details?.email || order.billingEmail,
      customerPhone: customer_details?.phone || order.billing?.phone || "9999999999",
      returnUrl: `${appUrl}/checkout/cashfree/return?order=${order.id}&key=${encodeURIComponent(order.orderKey)}`,
      notifyUrl: `${appUrl}/api/webhooks/cashfree`,
      note: `BCTLABS order #${order.id}`,
    });

    await Promise.all([
      setOrderMeta(order.id, "_cashfree_order_id", String(created.cf_order_id)),
      setOrderMeta(order.id, "_cashfree_order_status", created.order_status),
    ]);

    return NextResponse.json({
      payment_session_id: created.payment_session_id,
      order_id: order.id,
      cf_order_id: String(created.cf_order_id),
      amount: order.total,
      mode: paymentMode(),
      reused: false,
    });
  } catch (error) {
    // Cashfree only allows one order per id. If our meta was lost but the
    // gateway order exists, reuse its session instead of failing the retry.
    if (String(error).toLowerCase().includes("duplicate")) {
      const existing = await getCashfreeOrder(`bct-${order.id}`);
      if (existing?.payment_session_id) {
        await setOrderMeta(order.id, "_cashfree_order_id", String(existing.cf_order_id));
        return NextResponse.json({
          payment_session_id: existing.payment_session_id,
          order_id: order.id,
          cf_order_id: String(existing.cf_order_id),
          amount: order.total,
          mode: paymentMode(),
          reused: true,
        });
      }
    }
    console.error("Cashfree session creation failed", error);
    return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
  }
}

function paymentMode(): "sandbox" | "production" {
  return (process.env.CASHFREE_ENV ?? "sandbox").toLowerCase() === "production" ? "production" : "sandbox";
}
