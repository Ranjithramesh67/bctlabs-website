import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Container, StatusBadge } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { writeCart } from "@/lib/cart";
import {
  findSuccessfulPayment,
  getCashfreeOrder,
  getCashfreePayments,
  isPaidStatus,
} from "@/lib/cashfree";
import { getOrderById, getOrderMeta } from "@/lib/orders";
import { confirmOrderPayment } from "@/lib/payments";
import { IconCheck, IconRefresh } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Payment status" };

type SearchParams = Promise<{ order?: string; key?: string }>;

export default async function CashfreeReturnPage({ searchParams }: { searchParams: SearchParams }) {
  const { order: orderParam, key } = await searchParams;
  const orderId = Number(orderParam);

  if (!Number.isFinite(orderId) || orderId <= 0 || !key) {
    return <Outcome title="We could not find that order" />;
  }

  const order = await getOrderById(orderId);
  if (!order || order.orderKey !== key) {
    return <Outcome title="We could not find that order" />;
  }

  const cfOrderId = await getOrderMeta(orderId, "_cashfree_order_id");
  // The webhook may have already confirmed the payment before the customer
  // returned to the store, in which case the order is no longer "pending".
  let paid = order.status !== "pending" && Boolean(order.transactionId);
  let transactionId = order.transactionId ?? "";

  if (cfOrderId && !paid) {
    const [cfOrder, payments] = await Promise.all([
      getCashfreeOrder(cfOrderId),
      getCashfreePayments(cfOrderId),
    ]);
    const successful = findSuccessfulPayment(payments);
    paid = Boolean(successful) || isPaidStatus(cfOrder?.order_status);
    transactionId = successful ? String(successful.cf_payment_id) : "";

    if (paid && order.status === "pending") {
      await confirmOrderPayment({
        eventKey: `cashfree:RETURN_VERIFY:${transactionId || cfOrderId}`,
        orderId,
        provider: "cashfree",
        eventType: "RETURN_VERIFY",
        cfOrderId,
        cfPaymentId: transactionId || null,
        amount: order.total,
        payload: { source: "return_page" },
        transactionId,
        paymentMethod: "cashfree",
        paymentTitle: "Cashfree (online payment)",
      });
      await writeCart([]);
    }
  }

  if (paid) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <IconCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-900">Payment successful</h1>
          <p className="mt-2 text-sm text-slate-500">
            Thank you. Your payment was received and order{" "}
            <span className="font-semibold text-ink-900">#{order.id}</span> is now being prepared.
          </p>
          <dl className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Amount paid</dt>
              <dd className="font-bold text-ink-900">{formatPrice(order.total)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <StatusBadge status="processing" />
              </dd>
            </div>
            {transactionId ? (
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Transaction</dt>
                <dd className="font-mono text-xs text-slate-600">{transactionId}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href={`/checkout/success?order=${order.id}&key=${encodeURIComponent(order.orderKey)}`}>
              View order details
            </ButtonLink>
            <ButtonLink href="/shop" variant="outline">
              Continue shopping
            </ButtonLink>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <IconRefresh className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-900">
          Payment not completed
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          We have not received a successful payment for order{" "}
          <span className="font-semibold text-ink-900">#{order.id}</span> yet. If money was
          debited, it is usually confirmed within a few minutes and we will update your order
          automatically.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/checkout">Retry payment</ButtonLink>
          <ButtonLink href="/contact-us" variant="outline">
            Contact support
          </ButtonLink>
        </div>
        <p className="mt-5 text-xs text-slate-400">
          Already paid?{" "}
          <Link href="/order-tracking" className="font-semibold text-brand-700 hover:underline">
            Track your order
          </Link>{" "}
          to see the latest status.
        </p>
      </div>
    </Container>
  );
}

function Outcome({ title }: { title: string }) {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          The payment link is invalid or has expired. Please head back to the shop to start a new
          order.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop">Back to shop</ButtonLink>
          <ButtonLink href="/contact-us" variant="outline">
            Contact support
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
