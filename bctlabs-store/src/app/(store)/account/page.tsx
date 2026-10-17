import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { AddressBook } from "@/components/address-book";
import { ButtonLink, Card, Container } from "@/components/ui";
import { listAddresses } from "@/lib/addresses";
import { getCustomerById } from "@/lib/customers";
import { formatDate } from "@/lib/format";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session.customerId) redirect("/account/login");

  const customer = await getCustomerById(session.customerId);
  if (!customer) redirect("/account/login");
  const addresses = await listAddresses(session.customerId);

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();
  const details = [
    { label: "Email", value: customer.email },
    { label: "Name", value: fullName || customer.displayName },
    { label: "Phone", value: customer.phone || "Not provided" },
    { label: "Member since", value: formatDate(customer.registered) || "-" },
  ];

  return (
    <Container className="py-10">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <AccountNav />

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {customer.displayName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your account details, review your orders, and keep shopping.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Account details</h2>
                <p className="mt-1 text-sm text-slate-500">The details we use for orders and delivery.</p>
              </div>
              <ButtonLink href="/account/orders" variant="outline" size="sm">
                View orders
              </ButtonLink>
            </div>

            <dl className="mt-6 divide-y divide-slate-100">
              {details.map((row) => (
                <div key={row.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-6">
                  <dt className="w-40 shrink-0 text-sm font-medium text-slate-500">{row.label}</dt>
                  <dd className="text-sm text-slate-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <AddressBook initialAddresses={addresses} />
        </div>
      </div>
    </Container>
  );
}
