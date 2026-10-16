import type { Metadata } from "next";
import Link from "next/link";

import { Button, ButtonLink, Card, Container, EmptyState, Input, Label, Select, StatusBadge } from "@/components/ui";
import { formatDate, formatPrice, orderStatusLabel } from "@/lib/format";
import { getOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Orders" };

const ORDER_STATUSES = [
  "pending",
  "processing",
  "on-hold",
  "completed",
  "cancelled",
  "refunded",
  "failed",
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const status = firstValue(sp.status)?.trim() || undefined;
  const q = firstValue(sp.q)?.trim() || undefined;

  const orders = await getOrders({ status, search: q, limit: 100 });

  return (
    <Container className="py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            {orders.length} order{orders.length === 1 ? "" : "s"} shown
            {status ? ` with status "${orderStatusLabel(status)}"` : ""}
            {q ? ` matching "${q}"` : ""}.
          </p>
        </div>
      </header>

      <form
        action="/admin/orders"
        method="get"
        className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[200px_1fr_auto] sm:items-end"
      >
        <div>
          <Label htmlFor="filter-status">Status</Label>
          <Select id="filter-status" name="status" defaultValue={status ?? ""}>
            <option value="">All</option>
            {ORDER_STATUSES.map((option) => (
              <option key={option} value={option}>
                {orderStatusLabel(option)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-q">Search</Label>
          <Input
            id="filter-q"
            type="search"
            name="q"
            placeholder="Search by customer email"
            defaultValue={q ?? ""}
          />
        </div>
        <Button type="submit" className="sm:w-auto">
          Apply
        </Button>
      </form>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No orders found"
            description="Try a different status or search term."
            action={<ButtonLink href="/admin/orders" variant="outline">Clear filters</ButtonLink>}
          />
        </div>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="hidden w-full min-w-[44rem] text-left text-sm md:table">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Order
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Customer
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
                    <td className="px-5 py-4 text-slate-600">{order.billingEmail || "-"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {formatPrice(order.total, order.currency)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ButtonLink href={`/admin/orders/${order.id}`} variant="outline" size="sm">
                        View
                      </ButtonLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 md:hidden">
            {orders.map((order) => (
              <li key={order.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">#{order.id}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(order.dateCreated) || "-"}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.billingEmail || "-"}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-900">
                    {formatPrice(order.total, order.currency)}
                  </span>
                  <ButtonLink href={`/admin/orders/${order.id}`} variant="outline" size="sm">
                    View
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="mt-6 text-sm text-slate-500">
        <Link href="/admin" className="font-medium text-brand-700 hover:text-brand-800">
          Back to dashboard
        </Link>
      </p>
    </Container>
  );
}
