import type { Metadata } from "next";
import { ButtonLink, Card, Container, EmptyState, StatusBadge } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrderById } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order confirmation" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; key?: string }>;
}) {
  const params = await searchParams;
  const orderId = Number(params.order);
  const order = Number.isFinite(orderId) && orderId > 0 ? await getOrderById(orderId) : null;

  if (!order || !params.key || order.orderKey !== params.key) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Order not found"
          description="We could not find an order matching this confirmation link. It may have been removed, or the link may be incomplete."
          action={<ButtonLink href="/shop">Back to shop</ButtonLink>}
        />
      </Container>
    );
  }

  const billing = order.billing;

  return (
    <Container className="py-10">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Thank you{billing?.firstName ? `, ${billing.firstName}` : ""}!
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Your order has been received. We will send your invoice to{" "}
                {order.billingEmail || "your email address"}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">Order number</p>
              <p className="text-lg font-bold text-slate-900">#{order.id}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">Order details</h2>
            {order.dateCreated ? (
              <span className="text-xs text-slate-500">{formatDate(order.dateCreated)}</span>
            ) : null}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 text-right font-semibold">Price</th>
                  <th className="px-6 py-3 text-center font-semibold">Qty</th>
                  <th className="px-6 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{formatPrice(item.price)}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {formatPrice(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <aside className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Discount</dt>
                  <dd className="font-medium text-emerald-600">-{formatPrice(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-slate-500">Tax</dt>
                <dd className="font-medium text-slate-900">{formatPrice(order.tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="font-medium text-slate-900">
                  {order.shipping > 0 ? formatPrice(order.shipping) : "Free"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="font-bold text-slate-900">{formatPrice(order.total)}</dd>
              </div>
            </dl>
            {order.paymentTitle ? (
              <p className="mt-4 text-xs text-slate-500">Payment: {order.paymentTitle}</p>
            ) : null}
          </Card>

          {billing ? (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900">Billing address</h2>
              <address className="mt-3 space-y-0.5 text-sm not-italic text-slate-600">
                <p className="font-medium text-slate-800">
                  {billing.firstName} {billing.lastName}
                </p>
                {billing.company ? <p>{billing.company}</p> : null}
                <p>{billing.address1}</p>
                {billing.address2 ? <p>{billing.address2}</p> : null}
                <p>
                  {billing.city}, {billing.state} {billing.postcode}
                </p>
                <p>{billing.country}</p>
                {billing.email ? <p className="pt-1">{billing.email}</p> : null}
                {billing.phone ? <p>{billing.phone}</p> : null}
              </address>
            </Card>
          ) : null}

          <ButtonLink href="/shop" variant="outline" className="w-full">
            Continue shopping
          </ButtonLink>
        </aside>
      </div>
    </Container>
  );
}
