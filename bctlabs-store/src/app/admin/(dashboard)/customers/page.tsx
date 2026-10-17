import type { Metadata } from "next";
import Link from "next/link";

import { Card, Container, EmptyState } from "@/components/ui";
import { listAddressSummaries } from "@/lib/addresses";
import { getCustomers } from "@/lib/customers";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Customers" };

function addressSummary(saved: { label: string }[] | undefined): string {
  if (!saved?.length) return "-";
  const listed = saved.slice(0, 2).map((address) => address.label).join(", ");
  return saved.length > 2 ? `${listed} +${saved.length - 2}` : listed;
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers(200);
  const addressesByCustomer = await listAddressSummaries(customers.map((customer) => customer.id));

  return (
    <Container className="py-10">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Customers</h1>
        <p className="mt-2 text-sm text-slate-500">
          {customers.length} customer{customers.length === 1 ? "" : "s"}
        </p>
      </header>

      {customers.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No customers yet"
            description="Customer accounts will appear here once people register or place an order."
          />
        </div>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Phone</th>
                  <th scope="col" className="px-4 py-3">Saved addresses</th>
                  <th scope="col" className="px-4 py-3">Registered</th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Orders</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {customers.map((customer) => (
                  <tr key={customer.id} className="align-middle hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {customer.displayName || customer.username}
                    </td>
                    <td className="px-4 py-3">
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`} className="text-brand-700 hover:underline">
                          {customer.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{customer.phone || "-"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {addressSummary(addressesByCustomer.get(customer.id))}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(customer.registered) || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
                        className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        View orders
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Container>
  );
}
