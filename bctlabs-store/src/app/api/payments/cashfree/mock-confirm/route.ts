import { NextResponse } from "next/server";
import { z } from "zod";

import { writeCart } from "@/lib/cart";
import { isCashfreeMockEnabled } from "@/lib/cashfree";
import { getOrderById } from "@/lib/orders";
import { confirmOrderPayment } from "@/lib/payments";

const bodySchema = z.object({
  order_id: z.coerce.number().int().positive(),
  key: z.string().trim().min(1),
});

/**
 * Development-only Cashfree simulator. Lets the checkout flow be tested end to
 * end (order -> payment -> fulfilment) when no gateway credentials exist.
 */
export async function POST(request: Request) {
  if (!isCashfreeMockEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }

  const order = await getOrderById(parsed.data.order_id);
  if (!order || order.orderKey !== parsed.data.key) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.paymentMethod && order.paymentMethod !== "cashfree") {
    return NextResponse.json(
      { error: "This order was placed with cash on delivery and cannot be paid online." },
      { status: 400 },
    );
  }

  if (order.transactionId && !["pending", "on-hold", "failed"].includes(order.status)) {
    await writeCart([]);
    return NextResponse.json({ ok: true, status: "already_paid", order_id: order.id });
  }

  const result = await confirmOrderPayment({
    eventKey: `cashfree:MOCK_SUCCESS_WEBHOOK:${order.id}`,
    orderId: order.id,
    provider: "cashfree",
    eventType: "MOCK_SUCCESS_WEBHOOK",
    cfOrderId: `mock-${order.id}`,
    cfPaymentId: `mock_${order.id}`,
    amount: order.total,
    payload: { source: "cashfree_mock" },
    transactionId: `mock_${Date.now()}`,
    paymentMethod: "cashfree_test",
    paymentTitle: "Cashfree (test mode)",
  });

  await writeCart([]);
  return NextResponse.json({ ok: true, status: result.status, order_id: order.id });
}
