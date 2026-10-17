export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value) || 0;
  // Prisma Decimal and similar wrappers expose a string/number conversion.
  const candidate = value as { toNumber?: () => number; toString?: () => string };
  if (typeof candidate.toNumber === "function") return candidate.toNumber();
  if (typeof candidate.toString === "function") return Number(candidate.toString()) || 0;
  return 0;
}

export function formatPrice(value: number, currency = "INR"): string {
  const symbol = currency === "INR" ? "\u20b9" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 1970) return "";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Price label for product listings. Products without a price are shown as
 * "Price on request" instead of the misleading "0.00".
 */
export function formatProductPrice(value: number, currency = "INR"): string {
  if (!Number.isFinite(value) || value <= 0) return "Price on request";
  return formatPrice(value, currency);
}

/**
 * Detects placeholder copy imported from the old theme (Lorem Ipsum and
 * friends) so pages and posts can fall back to real content instead of
 * showing dummy text to customers.
 */
export function isPlaceholderContent(html: string | null | undefined): boolean {
  if (!html) return true;
  const plain = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .toLowerCase();
  return /lorem ipsum|dummy text|consectetur adipisicing|printing and typesetting|dolor sit amet/.test(
    plain,
  );
}

/** Strip WordPress shortcodes and Elementor/VBakery wrappers from raw content. */
export function cleanContent(html: string): string {
  if (!html) return "";
  return html
    .replace(/\[(?:\/)?[a-zA-Z_][^\]]*\]/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .trim();
}

export function truncate(text: string, length = 160): string {
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= length) return plain;
  return `${plain.slice(0, length - 1).trimEnd()}\u2026`;
}

export function orderStatusLabel(status: string | null | undefined): string {
  const map: Record<string, string> = {
    pending: "Pending payment",
    processing: "Processing",
    "on-hold": "On hold",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    failed: "Failed",
    "checkout-draft": "Draft",
  };
  return map[status ?? ""] ?? (status ?? "").replace(/-/g, " ");
}

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: "Shipment created",
  PICKUP_SCHEDULED: "Pickup scheduled",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  RTO_IN_TRANSIT: "Returning to origin",
  RTO_DELIVERED: "Returned to origin",
  CANCELLED: "Shipment cancelled",
  EXCEPTION: "Delivery exception",
  UNKNOWN: "Awaiting tracking update",
};

export function shipmentStatusLabel(status: string | null | undefined): string {
  return SHIPMENT_STATUS_LABELS[status ?? ""] ?? (status ?? "").replace(/_/g, " ").toLowerCase();
}
