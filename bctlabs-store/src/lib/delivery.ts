export type DeliveryState = "idle" | "checking" | "serviceable" | "unserviceable" | "unavailable";

export type DeliveryStatus = {
  state: DeliveryState;
  message: string;
  courierName?: string;
  cheapestRate?: number;
  estimatedDays?: string;
};

export function initialDeliveryStatus(): DeliveryStatus {
  return { state: "idle", message: "" };
}

/**
 * A gateway outage must never stop checkout, so only an unanswered or explicit
 * "not deliverable" result blocks the order.
 */
export function shouldBlockCheckout(status: DeliveryStatus, enabled: boolean): boolean {
  if (!enabled) return false;
  return status.state === "idle" || status.state === "checking" || status.state === "unserviceable";
}
