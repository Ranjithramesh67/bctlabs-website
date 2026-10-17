import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrackingStepper } from "@/components/tracking-stepper";
import { ButtonLink, Card, Container, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getOrderById } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { getShipmentForOrder, getShipmentTimeline } from "@/lib/shipments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Track order" };

type TrackPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ key?: string | string[] }>;
};

export default async function TrackOrderPage({ params, searchParams }: TrackPageProps) {
  const { id } = await params;
  const query: { key?: string | string[] } = (await searchParams) ?? {};
  const key = Array.isArray(query.key) ? query.key[0] : query.key;

  const orderId = Number(id);
  const order = Number.isInteger(orderId) && orderId > 0 ? await getOrderById(orderId) : null;
  if (!order) notFound();

  const session = await getSession();
  const isOwner =
    typeof session.customerId === "number" && session.customerId === order.customerId;
  const keyMatches = Boolean(key) && key === order.orderKey;
  if (!isOwner && !keyMatches) notFound();

  const shipment = await getShipmentForOrder(order.id);
  const timeline = shipment ? await getShipmentTimeline(shipment.id) : [];

  return (
    <main className="min-h-screen bg-[#f7f5f9]">
      <Container className="py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                Order tracking
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Order #{order.id}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Placed {formatDate(order.dateCreated) || "-"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={order.status} />
              <ButtonLink href="/order-tracking" variant="outline" size="sm">
                Back to order tracking
              </ButtonLink>
              {isOwner ? (
                <ButtonLink href={`/account/orders/${order.id}`} variant="outline" size="sm">
                  View account order
                </ButtonLink>
              ) : null}
            </div>
          </div>

          {shipment ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card className="p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-slate-900">Shipment</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Courier</dt>
                    <dd className="mt-0.5 font-medium text-slate-900">
                      {shipment.courierName || "NimbusPost"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">AWB number</dt>
                    <dd className="mt-0.5 font-mono font-medium text-slate-900">
                      {shipment.awbNumber ?? "Not assigned"}
                    </dd>
                  </div>
                </dl>

                {shipment.labelUrl ? (
                  <p className="mt-6">
                    <a
                      href={shipment.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                      Download shipping label
                    </a>
                  </p>
                ) : null}
              </Card>

              <Card className="p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-slate-900">Delivery progress</h2>
                <TrackingStepper status={shipment.status} timeline={timeline} />
              </Card>
            </div>
          ) : (
            <Card className="p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">Shipment</h2>
              <p className="mt-2 text-sm text-slate-600">Shipment not created yet</p>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                Order status
                <StatusBadge status={order.status} />
              </p>
            </Card>
          )}
        </div>
      </Container>
    </main>
  );
}
