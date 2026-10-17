import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminOrderStatus } from "@/components/admin-order-status";
import { AdminShipmentPanel } from "@/components/admin-shipment-panel";
import { ButtonLink, Card, Container, StatusBadge } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { isNimbusPostConfigured } from "@/lib/nimbuspost";
import { getOrderById, type Address } from "@/lib/orders";
import { getShipmentForOrder } from "@/lib/shipments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order details" };

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

function AddressBlock({ address }: { address: Address | null }) {
  if (!address) {
    return <p className="text-sm text-slate-500">Not provided</p>;
  }

  const name = `${address.firstName} ${address.lastName}`.trim();
  const cityLine = [address.city, address.state, address.postcode].filter(Boolean).join(", ");

  return (
    <address className="not-italic text-sm leading-relaxed text-slate-600">
      {name ? <span className="block font-medium text-slate-900">{name}</span> : null}
      {address.company ? <span className="block">{address.company}</span> : null}
      {address.address1 ? <span className="block">{address.address1}</span> : null}
      {address.address2 ? <span className="block">{address.address2}</span> : null}
      {cityLine ? <span className="block">{cityLine}</span> : null}
      {address.country ? <span className="block">{address.country}</span> : null}
      {address.email ? <span className="mt-1 block text-slate-500">{address.email}</span> : null}
      {address.phone ? <span className="block text-slate-500">{address.phone}</span> : null}
    </address>
  );
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(Number(id));
  if (!order) notFound();
  const shipment = await getShipmentForOrder(order.id);

  const payment = order.paymentTitle || order.paymentMethod || "Not provided";

  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/admin/orders" className="transition-colors hover:text-brand-700">
              Orders
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li aria-current="page" className="font-medium text-slate-900">
            #{order.id}
          </li>
        </ol>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Order #{order.id}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed {formatDate(order.dateCreated) || "-"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(order.total, order.currency)}
          </span>
          <ButtonLink href="/admin/orders" variant="outline" size="sm">
            Back to orders
          </ButtonLink>
        </div>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Update status</h2>
        <p className="mt-1 text-xs text-slate-500">
          Changing the status notifies the customer in the connected WooCommerce store.
        </p>
        <div className="mt-4">
          <AdminOrderStatus orderId={order.id} status={order.status} />
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Shipment</h2>
        <p className="mt-1 text-xs text-slate-500">NimbusPost booking, tracking and courier manifest.</p>
        <div className="mt-4">
          <AdminShipmentPanel
            orderId={order.id}
            configured={isNimbusPostConfigured()}
            shipment={
              shipment
                ? {
                    awbNumber: shipment.awbNumber,
                    courierName: shipment.courierName,
                    status: shipment.status,
                    statusUpdatedAt: shipment.statusUpdatedAt ? shipment.statusUpdatedAt.toISOString() : null,
                    manifestUrl: shipment.manifestUrl,
                  }
                : null
            }
          />
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Item
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Qty
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Price
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-medium text-slate-900">{item.name}</td>
                  <td className="px-5 py-4 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-4 text-right text-slate-600">
                    {formatPrice(item.price, order.currency)}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-900">
                    {formatPrice(item.total, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/60 p-5">
          <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-medium text-slate-900">{formatPrice(order.subtotal, order.currency)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Discount</dt>
              <dd className="font-medium text-slate-900">
                {order.discount > 0
                  ? `-${formatPrice(order.discount, order.currency)}`
                  : formatPrice(0, order.currency)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Tax</dt>
              <dd className="font-medium text-slate-900">{formatPrice(order.tax, order.currency)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd className="font-medium text-slate-900">
                {order.shipping > 0 ? formatPrice(order.shipping, order.currency) : "Free"}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-bold text-slate-900">{formatPrice(order.total, order.currency)}</dd>
            </div>
          </dl>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900">Billing address</h2>
          <div className="mt-3">
            <AddressBlock address={order.billing} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900">Shipping address</h2>
          <div className="mt-3">
            <AddressBlock address={order.shippingAddress} />
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Payment method</h2>
        <p className="mt-2 text-sm text-slate-600">{payment}</p>
        {order.paymentTitle && order.paymentMethod ? (
          <p className="mt-1 text-xs text-slate-500">Method: {order.paymentMethod}</p>
        ) : null}
      </Card>

      {order.customerNote ? (
        <Card className="mt-6 p-5">
          <h2 className="text-sm font-semibold text-slate-900">Customer note</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{order.customerNote}</p>
        </Card>
      ) : null}
    </Container>
  );
}
