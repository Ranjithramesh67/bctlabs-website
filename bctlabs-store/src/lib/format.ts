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
