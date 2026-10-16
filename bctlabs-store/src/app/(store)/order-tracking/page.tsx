import type { Metadata } from "next";
import { OrderTrackingForm } from "@/components/order-tracking-form";
import { Container } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order tracking" };

export default async function OrderTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const params = await searchParams;

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order tracking</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your order number and the billing email you used at checkout to see the latest
            status of your order.
          </p>
        </div>
        <OrderTrackingForm
          initialOrder={params.order ?? ""}
          initialEmail={params.email ?? ""}
        />
      </div>
    </Container>
  );
}
