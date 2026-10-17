"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";
import { shipmentStatusLabel } from "@/lib/format";

type ShipmentView = {
  awbNumber: string | null;
  courierName: string | null;
  status: string;
  statusUpdatedAt: string | null;
  manifestUrl: string | null;
};

type Feedback = { tone: "success" | "error"; text: string };

export function AdminShipmentPanel({
  orderId,
  shipment,
  configured,
}: {
  orderId: number;
  shipment: ShipmentView | null;
  configured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"create" | "manifest" | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [manifestUrl, setManifestUrl] = useState(shipment?.manifestUrl ?? null);

  async function createShipment() {
    setBusy("create");
    setFeedback(null);
    try {
      const response = await fetch("/api/logistics/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback({ tone: "error", text: body.error || "Could not create the shipment." });
        return;
      }
      setFeedback({
        tone: "success",
        text: `Booked with ${body.courier_name || "courier"}. AWB ${body.awb_number}.`,
      });
      router.refresh();
    } catch {
      setFeedback({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  async function generateManifest() {
    if (!shipment?.awbNumber) return;
    setBusy("manifest");
    setFeedback(null);
    try {
      const response = await fetch("/api/logistics/generate-manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courier_name: shipment.courierName ?? undefined,
          awbs: [shipment.awbNumber],
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback({ tone: "error", text: body.error || "Could not generate the manifest." });
        return;
      }
      if (body.pdf_url) {
        setManifestUrl(body.pdf_url);
        window.open(body.pdf_url, "_blank", "noopener,noreferrer");
      } else {
        setFeedback({ tone: "success", text: "Manifest generated." });
      }
      router.refresh();
    } catch {
      setFeedback({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {shipment?.awbNumber ? (
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">AWB number</dt>
            <dd className="mt-0.5 font-mono font-medium text-slate-900">{shipment.awbNumber}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Courier</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{shipment.courierName || "NimbusPost"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Tracking status</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{shipmentStatusLabel(shipment.status)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Last update</dt>
            <dd className="mt-0.5 text-slate-600">
              {shipment.statusUpdatedAt ? new Date(shipment.statusUpdatedAt).toLocaleString("en-IN") : "-"}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-slate-600">
          No shipment yet. Book the cheapest available courier for the delivery pincode.
        </p>
      )}

      {feedback ? (
        <p
          role="status"
          className={`mt-3 text-sm ${feedback.tone === "success" ? "text-emerald-700" : "text-red-600"}`}
        >
          {feedback.text}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {configured ? (
          <Button
            type="button"
            size="sm"
            onClick={createShipment}
            disabled={busy !== null || Boolean(shipment?.awbNumber)}
          >
            {busy === "create" ? "Booking..." : shipment?.awbNumber ? "Shipment booked" : "Create shipment"}
          </Button>
        ) : null}
        {shipment?.awbNumber && configured ? (
          <Button type="button" size="sm" variant="outline" onClick={generateManifest} disabled={busy !== null}>
            {busy === "manifest" ? "Generating..." : "Generate manifest"}
          </Button>
        ) : null}
        {manifestUrl ? (
          <a
            href={manifestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-center text-sm font-medium text-brand-700 underline"
          >
            Download manifest PDF
          </a>
        ) : null}
      </div>

      {!configured ? (
        <p className="mt-3 text-xs text-slate-500">
          Logistics is not configured. Set NIMBUSPOST_API_KEY, NIMBUSPOST_API_SECRET and an origin pincode to
          enable shipments.
        </p>
      ) : null}
    </div>
  );
}
