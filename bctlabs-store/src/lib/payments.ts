import "server-only";

import { prisma } from "./prisma";
import { markOrderPaid, getOrderById } from "./orders";
import { triggerFulfillment } from "./fulfillment";

export type PaymentEventInput = {
  /** Unique per provider event, e.g. `cashfree:PAYMENT_SUCCESS_WEBHOOK:<paymentId>`. */
  eventKey: string;
  orderId?: number | null;
  provider: string;
  eventType: string;
  cfOrderId?: string | null;
  cfPaymentId?: string | null;
  amount?: number | null;
  payload?: unknown;
};

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { code?: string }).code === "P2002");
}

/**
 * Record a gateway event exactly once. The unique `event_key` is the
 * idempotency gate: a replayed webhook returns `duplicate: true` and the
 * caller must not repeat side effects.
 */
export async function recordPaymentEvent(
  input: PaymentEventInput,
): Promise<{ duplicate: boolean }> {
  try {
    await prisma.bctlabs_payment_events.create({
      data: {
        event_key: input.eventKey,
        order_id: input.orderId ? BigInt(input.orderId) : null,
        provider: input.provider,
        event_type: input.eventType,
        cf_order_id: input.cfOrderId ?? null,
        cf_payment_id: input.cfPaymentId ?? null,
        amount: input.amount ?? null,
        payload: (input.payload ?? null) as never,
      },
    });
    return { duplicate: false };
  } catch (error) {
    if (isUniqueViolation(error)) return { duplicate: true };
    throw error;
  }
}

export type ConfirmPaymentInput = PaymentEventInput & {
  transactionId: string;
  paymentMethod?: string;
  paymentTitle?: string;
};

export type ConfirmPaymentResult = {
  status: "paid" | "already_paid" | "duplicate" | "not_found" | "rejected";
  orderId: number | null;
};

/**
 * Idempotently mark an order paid and kick off fulfilment.
 *
 * Order status is only ever changed here (server side) - never from a client
 * payload - and fulfilment runs after the money is confirmed.
 */
export async function confirmOrderPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
  const { duplicate } = await recordPaymentEvent(input);
  if (duplicate) return { status: "duplicate", orderId: input.orderId ?? null };

  const orderId = input.orderId ?? null;
  if (!orderId) return { status: "not_found", orderId: null };

  const order = await getOrderById(orderId);
  if (!order) return { status: "not_found", orderId };

  // A Cashfree event can never settle an order that was placed as cash on
  // delivery (or with another provider).
  if (input.provider === "cashfree" && order.paymentMethod && order.paymentMethod !== "cashfree") {
    console.error(`Refusing Cashfree payment for order ${orderId} paid via ${order.paymentMethod}`);
    return { status: "rejected", orderId };
  }

  const alreadyPaid =
    Boolean(order.transactionId) &&
    !["pending", "on-hold", "failed", "checkout-draft"].includes(order.status);
  if (alreadyPaid) return { status: "already_paid", orderId };

  await markOrderPaid(orderId, {
    transactionId: input.transactionId,
    paymentMethod: input.paymentMethod,
    paymentTitle: input.paymentTitle,
  });

  // Never let a courier API failure roll back a confirmed payment.
  await triggerFulfillment(orderId).catch((error) => {
    console.error(`Fulfilment trigger failed for order ${orderId}`, error);
  });

  return { status: "paid", orderId };
}

export async function isEventProcessed(eventKey: string): Promise<boolean> {
  const row = await prisma.bctlabs_payment_events.findUnique({
    where: { event_key: eventKey },
    select: { id: true },
  });
  return Boolean(row);
}
