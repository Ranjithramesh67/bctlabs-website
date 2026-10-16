"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Label, Select } from "@/components/ui";
import { orderStatusLabel } from "@/lib/format";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "on-hold",
  "completed",
  "cancelled",
  "refunded",
  "failed",
] as const;

type Feedback = { tone: "success" | "error"; text: string };

export function AdminOrderStatus({ orderId, status }: { orderId: number; status: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(status);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function updateStatus() {
    setPending(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selected }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setFeedback({ tone: "error", text: data?.error ?? "Unable to update the order status." });
        return;
      }
      setFeedback({ tone: "success", text: "Order status updated." });
      router.refresh();
    } catch {
      setFeedback({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <Label htmlFor="order-status">Order status</Label>
          <Select
            id="order-status"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            {ORDER_STATUSES.map((option) => (
              <option key={option} value={option}>
                {orderStatusLabel(option)}
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" onClick={updateStatus} disabled={pending}>
          {pending ? "Updating..." : "Update status"}
        </Button>
      </div>

      {feedback ? (
        <p
          role="status"
          className={
            feedback.tone === "success"
              ? "rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700"
              : "rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
          }
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
