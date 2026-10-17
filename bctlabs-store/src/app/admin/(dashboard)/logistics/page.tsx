import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminManifestTable } from "@/components/admin-manifest-table";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { getAdminSession, isStaffUser } from "@/lib/admin-auth";
import { getPendingShipmentsByCourier } from "@/lib/shipments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Logistics" };

export default async function AdminLogisticsPage() {
  const session = await getAdminSession();
  if (!session.userId || !(await isStaffUser(session.userId))) redirect("/admin/login");

  const pending = await getPendingShipmentsByCourier();
  const groups = Object.entries(pending)
    .map(([courier, shipments]) => ({
      courier,
      courierId: shipments.find((shipment) => shipment.courierId !== null)?.courierId ?? null,
      shipments: shipments.map((shipment) => ({
        orderId: shipment.orderId,
        awbNumber: shipment.awbNumber,
        customerName: shipment.customerName,
        orderTotal: shipment.orderTotal,
        status: shipment.status,
        createdAt: shipment.createdAt.toISOString(),
      })),
    }))
    .sort((a, b) => a.courier.localeCompare(b.courier));

  const totalShipments = groups.reduce((sum, group) => sum + group.shipments.length, 0);

  return (
    <Container className="py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Logistics</h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalShipments === 0
              ? "Generate courier manifests for shipments that are ready for handover."
              : `${totalShipments} shipment${totalShipments === 1 ? "" : "s"} awaiting pickup across ${groups.length} courier${groups.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <ButtonLink href="/admin/logistics" variant="outline" size="sm">
          Refresh
        </ButtonLink>
      </header>

      <div className="mt-6">
        {groups.length === 0 ? (
          <EmptyState
            title="No shipments awaiting pickup."
            description="Booked shipments will appear here once they are ready for a courier handover."
            action={
              <ButtonLink href="/admin/orders" variant="outline">
                View orders
              </ButtonLink>
            }
          />
        ) : (
          <AdminManifestTable groups={groups} />
        )}
      </div>
    </Container>
  );
}
