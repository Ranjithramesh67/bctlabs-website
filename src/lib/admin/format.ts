/** Laravel `Str::limit($value, $limit, $end)`. */
export function strLimit(
  value: string | null | undefined,
  limit: number,
  end = "...",
): string {
  const text = value ?? "";
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).replace(/\s+$/, "")}${end}`;
}

/** PHP `html_entity_decode()` for the common named/numeric entities. */
export function htmlDecode(value: string | null | undefined): string {
  const text = value ?? "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    );
}

/** PHP `ucfirst()`. */
export function ucfirst(value: string): string {
  return value.length ? value[0].toUpperCase() + value.slice(1) : value;
}

/** PHP `number_format($value, 2)`. */
export function numberFormat2(value: number | string | null | undefined): string {
  const numeric = Number(value ?? 0);
  return numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Laravel `Str::slug()` (ASCII mode).
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
