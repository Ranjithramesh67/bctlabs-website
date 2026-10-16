import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountNav } from "@/components/account-nav";
import { ButtonLink, Card, Container, EmptyState, StatusBadge } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrdersForCustomer } from "@/lib/orders";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await getSession();
  if (!session.customerId) redirect("/account/login");

  const orders = await getOrdersForCustomer(session.customerId);

  return (
    <Container className="py-10">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <AccountNav />

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">A history of every order you have placed with us.</p>
          </div>

          {orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="When you place an order it will appear here so you can track its progress."
              action={<ButtonLink href="/shop">Start shopping</ButtonLink>}
            />
          ) : (
            <Card className="overflow-hidden">
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Order
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      Total
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-slate-900">#{order.id}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(order.dateCreated) || "-"}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">
                        {formatPrice(order.total, order.currency)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ButtonLink href={`/account/orders/${order.id}`} variant="outline" size="sm">
                          View
                        </ButtonLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="divide-y divide-slate-100 md:hidden">
                {orders.map((order) => (
                  <li key={order.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">#{order.id}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatDate(order.dateCreated) || "-"}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="font-medium text-slate-900">
                        {formatPrice(order.total, order.currency)}
                      </span>
                      <ButtonLink href={`/account/orders/${order.id}`} variant="outline" size="sm">
                        View
                      </ButtonLink>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="text-sm text-slate-500">
            Need to find an order without signing in?{" "}
            <Link href="/order-tracking" className="font-medium text-brand-700 hover:text-brand-800">
              Track an order
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
