"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { initialDeliveryStatus, type DeliveryStatus } from "@/lib/delivery";

const DEBOUNCE_MS = 500;

type ServiceabilityResponse = {
  serviceable?: boolean;
  cheapest_rate?: number;
  estimated_days?: string;
  cheapest_courier?: string;
  cheapest?: {
    courier_name?: string;
    total?: number;
    estimated_delivery_days?: string;
  };
  reason?: string;
  error?: string;
};

function deliveryMessage(estimatedDays?: string, courierName?: string): string {
  if (estimatedDays && courierName) return `Delivery in ${estimatedDays} via ${courierName}`;
  if (courierName) return `Delivery via ${courierName}`;
  if (estimatedDays) return `Delivery in ${estimatedDays}`;
  return "Delivery available";
}

export function DeliveryCheck({
  pincode,
  weightGrams,
  paymentMode,
  enabled,
  onStatusChange,
}: {
  pincode: string;
  weightGrams: number;
  paymentMode: "prepaid" | "cod";
  enabled: boolean;
  onStatusChange: (status: DeliveryStatus) => void;
}) {
  const [status, setStatus] = useState<DeliveryStatus>(initialDeliveryStatus);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    const emit = (next: DeliveryStatus) => {
      setStatus(next);
      onStatusChangeRef.current(next);
    };

    if (!enabled) {
      emit(initialDeliveryStatus());
      return;
    }

    const destination = pincode.trim();
    if (!/^\d{6}$/.test(destination)) {
      emit(initialDeliveryStatus());
      return;
    }

    const controller = new AbortController();
    emit({ state: "checking", message: "Checking delivery availability..." });

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/logistics/serviceability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination_pincode: destination,
            weight_grams: weightGrams,
            payment_mode: paymentMode,
          }),
          signal: controller.signal,
        });
        const data = (await response.json().catch(() => null)) as ServiceabilityResponse | null;
        if (controller.signal.aborted) return;

        if (response.status === 200 && data?.serviceable !== false) {
          const courierName = data?.cheapest_courier || data?.cheapest?.courier_name || undefined;
          const estimatedDays = data?.estimated_days || data?.cheapest?.estimated_delivery_days || undefined;
          const rate = data?.cheapest_rate ?? data?.cheapest?.total;
          emit({
            state: "serviceable",
            message: deliveryMessage(estimatedDays, courierName),
            courierName,
            cheapestRate: typeof rate === "number" ? rate : undefined,
            estimatedDays,
          });
          return;
        }

        if (response.status === 400) {
          emit({
            state: "unserviceable",
            message: data?.error || data?.reason || "We cannot deliver to this pincode yet.",
          });
          return;
        }

        emit({ state: "unavailable", message: "Delivery estimate unavailable right now" });
      } catch (error) {
        if (controller.signal.aborted || (error as { name?: string } | null)?.name === "AbortError") {
          return;
        }
        emit({ state: "unavailable", message: "Delivery estimate unavailable right now" });
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, pincode, weightGrams, paymentMode]);

  if (!enabled || status.state === "idle") return null;

  const tone =
    status.state === "serviceable"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status.state === "unserviceable"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div
      role="status"
      data-testid="delivery-status"
      className={clsx("mt-4 rounded-xl border px-4 py-3 text-sm font-medium", tone)}
    >
      {status.message}
    </div>
  );
}
