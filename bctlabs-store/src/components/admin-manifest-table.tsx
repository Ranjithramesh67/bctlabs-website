"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card } from "@/components/ui";
import { formatDate, shipmentStatusLabel } from "@/lib/format";

type ManifestShipment = {
  orderId: number;
  awbNumber: string | null;
  customerName: string;
  orderTotal: number | null;
  status: string;
  createdAt: string;
};

type ManifestGroup = {
  courier: string;
  courierId: string | null;
  shipments: ManifestShipment[];
};

type ManifestResponse = {
  ok?: boolean;
  batch_reference?: string;
  manifest_url?: string | null;
  error?: string;
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function selectableAwbs(group: ManifestGroup): string[] {
  return group.shipments
    .map((shipment) => shipment.awbNumber)
    .filter((awb): awb is string => Boolean(awb));
}

export function AdminManifestTable({ groups }: { groups: ManifestGroup[] }) {
  const router = useRouter();
  const [selectedByCourier, setSelectedByCourier] = useState<Record<string, string[]>>({});
  const [busyCourier, setBusyCourier] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, { tone: "success" | "error"; text: string }>>({});

  function toggleAwb(group: ManifestGroup, awb: string) {
    const allowed = new Set(selectableAwbs(group));
    setSelectedByCourier((current) => {
      // Never retain an AWB that does not belong to this courier group.
      const selected = (current[group.courier] ?? []).filter((value) => allowed.has(value));
      const next = selected.includes(awb)
        ? selected.filter((value) => value !== awb)
        : [...selected, awb];
      return { ...current, [group.courier]: next };
    });
  }

  function toggleAll(group: ManifestGroup) {
    const awbs = selectableAwbs(group);
    setSelectedByCourier((current) => {
      const selected = (current[group.courier] ?? []).filter((value) => awbs.includes(value));
      const allSelected = awbs.length > 0 && awbs.every((awb) => selected.includes(awb));
      return { ...current, [group.courier]: allSelected ? [] : awbs };
    });
  }

  async function generateManifest(group: ManifestGroup) {
    const awbs = selectableAwbs(group);
    const selected = (selectedByCourier[group.courier] ?? []).filter((awb) => awbs.includes(awb));
    if (!selected.length || busyCourier) return;

    setBusyCourier(group.courier);
    setMessages((current) => {
      const next = { ...current };
      delete next[group.courier];
      return next;
    });

    try {
      const response = await fetch("/api/admin/logistics/generate-manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awb_list: selected,
          courier_id: group.courierId ?? undefined,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as ManifestResponse;

      if (!response.ok) {
        setMessages((current) => ({
          ...current,
          [group.courier]: {
            tone: "error",
            text: body.error || "Could not generate the manifest.",
          },
        }));
        return;
      }

      setMessages((current) => ({
        ...current,
        [group.courier]: {
          tone: "success",
          text: body.batch_reference
            ? `Manifest ${body.batch_reference} generated.`
            : "Manifest generated.",
        },
      }));
      setSelectedByCourier((current) => ({ ...current, [group.courier]: [] }));

      const manifestUrl = body.manifest_url;
      if (manifestUrl) {
        window.open(manifestUrl, "_blank", "noopener,noreferrer");
      }
      router.refresh();
    } catch {
      setMessages((current) => ({
        ...current,
        [group.courier]: {
          tone: "error",
          text: "Network error. Please try again.",
        },
      }));
    } finally {
      setBusyCourier(null);
    }
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const awbs = selectableAwbs(group);
        const selected = (selectedByCourier[group.courier] ?? []).filter((awb) => awbs.includes(awb));
        const allSelected = awbs.length > 0 && awbs.every((awb) => selected.includes(awb));
        const subtotal = group.shipments.reduce(
          (sum, shipment) => sum + (shipment.orderTotal ?? 0),
          0,
        );
        const message = messages[group.courier];
        const busy = busyCourier === group.courier;

        return (
          <Card key={group.courier} className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{group.courier}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {group.shipments.length} shipment{group.shipments.length === 1 ? "" : "s"} - Subtotal{" "}
                  {money.format(subtotal)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-600">{selected.length} selected</span>
                <Button
                  type="button"
                  size="sm"
                  data-testid="manifest-button"
                  disabled={!selected.length || busyCourier !== null}
                  onClick={() => generateManifest(group)}
                >
                  {busy ? "Generating..." : `Generate manifest (${selected.length})`}
                </Button>
              </div>
            </div>

            {message ? (
              <p
                role="status"
                className={
                  message.tone === "success"
                    ? "border-b border-emerald-100 bg-emerald-50 px-5 py-3 text-sm text-emerald-800"
                    : "border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-700"
                }
              >
                {message.text}
              </p>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        disabled={!awbs.length}
                        onChange={() => toggleAll(group)}
                        aria-label={`Select all shipments for ${group.courier}`}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">Order</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                    <th scope="col" className="px-5 py-3 font-semibold">AWB</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.shipments.map((shipment) => {
                    const checked =
                      shipment.awbNumber !== null && selected.includes(shipment.awbNumber);
                    return (
                      <tr
                        key={`${group.courier}-${shipment.orderId}`}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!shipment.awbNumber}
                            onChange={() => {
                              if (shipment.awbNumber) toggleAwb(group, shipment.awbNumber);
                            }}
                            aria-label={`Select AWB ${shipment.awbNumber ?? "not assigned"} for order ${shipment.orderId}`}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/orders/${shipment.orderId}`}
                            className="font-semibold text-brand-700 hover:text-brand-800"
                          >
                            #{shipment.orderId}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {shipment.customerName || "Guest"}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-900">
                          {shipment.awbNumber ?? "-"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {shipmentStatusLabel(shipment.status)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(shipment.createdAt) || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
