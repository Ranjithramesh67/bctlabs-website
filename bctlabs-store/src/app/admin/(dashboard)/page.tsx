import Link from "next/link";
import { ButtonLink, Card, Container, EmptyState, StatusBadge } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrderStats } from "@/lib/orders";
import { getCustomerCount } from "@/lib/customers";
import { getContactMessageCount } from "@/lib/messages";
import { getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

type Stat = {
  label: string;
  value: string;
  chip: string;
};

export default async function AdminDashboardPage() {
  const [stats, productResult, customerCount, messageCount] = await Promise.all([
    getOrderStats(),
    getProducts({ perPage: 1 }),
    getCustomerCount(),
    getContactMessageCount(),
  ]);

  const cards: Stat[] = [
    { label: "Total orders", value: stats.totalOrders.toLocaleString("en-IN"), chip: "bg-slate-100 text-slate-600" },
    { label: "Revenue", value: formatPrice(stats.revenue), chip: "bg-emerald-100 text-emerald-700" },
    { label: "Pending", value: stats.pending.toLocaleString("en-IN"), chip: "bg-amber-100 text-amber-800" },
    { label: "Processing", value: stats.processing.toLocaleString("en-IN"), chip: "bg-sky-100 text-sky-700" },
    { label: "Completed", value: stats.completed.toLocaleString("en-IN"), chip: "bg-emerald-100 text-emerald-700" },
    { label: "Products", value: productResult.total.toLocaleString("en-IN"), chip: "bg-brand-100 text-brand-700" },
    { label: "Customers", value: customerCount.toLocaleString("en-IN"), chip: "bg-indigo-100 text-indigo-700" },
    { label: "Messages", value: messageCount.toLocaleString("en-IN"), chip: "bg-rose-100 text-rose-700" },
  ];

  return (
    <Container className="py-10">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Store performance and activity at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/orders" variant="primary" size="sm">
            Orders
          </ButtonLink>
          <ButtonLink href="/admin/products" variant="outline" size="sm">
            Products
          </ButtonLink>
          <ButtonLink href="/admin/messages" variant="outline" size="sm">
            Messages
          </ButtonLink>
        </div>
      </header>

      <section
        aria-label="Store statistics"
        className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${card.chip}`} aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        </div>

        {stats.recent.length ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">Order</th>
                    <th scope="col" className="px-5 py-3">Date</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-900">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-brand-600">
                          #{order.id}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                        {formatDate(order.dateCreated) || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium text-slate-900">
                        {formatPrice(order.total, order.currency || "INR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No orders yet"
            description="New orders will appear here as customers check out."
          />
        )}
      </section>
    </Container>
  );
}
