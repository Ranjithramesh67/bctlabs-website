import "server-only";

/**
 * Laravel serialises Eloquent dates as ISO-8601 with microsecond precision
 * (`2024-03-22T01:00:00.000000Z`). JavaScript's `toISOString()` only carries
 * milliseconds, so pad the fraction to six digits to keep the wire format the
 * mobile app has always received.
 */
export function laravelDate(date: Date): string {
  return date.toISOString().replace(/\.(\d{3})Z$/, ".$1000Z");
}

/**
 * Recursively convert Prisma result values to a JSON-safe structure that
 * mirrors Laravel's `Model::toArray()`:
 *  - `BigInt` primary keys become numbers (Laravel exposes them as ints),
 *  - `Date` values become Laravel-style ISO strings.
 */
export function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value instanceof Date) {
    return laravelDate(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => jsonSafe(item));
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = jsonSafe(item);
    }
    return result;
  }
  return value;
}

/**
 * Base URL for Laravel's `url()` / `asset()` helpers. Laravel derives this from
 * the incoming request (or `APP_URL` when `ASSET_URL` is configured); we prefer
 * an explicit `APP_URL` and otherwise fall back to the request origin.
 */
export function appBaseUrl(request: Request): string {
  const configured = process.env.APP_URL?.trim();
  const base =
    configured && configured.length > 0
      ? configured
      : new URL(request.url).origin;
  return base.replace(/\/+$/, "");
}

/**
 * Mirrors Laravel's `url()`/`asset()`: absolute URLs pass through untouched,
 * relative paths are resolved against the app base, and `null` yields the app
 * root with a trailing slash (Laravel's `url(null)`).
 */
export function laravelUrl(
  request: Request,
  path: string | null | undefined,
): string {
  if (path && /^https?:\/\//i.test(path)) {
    return path;
  }
  return `${appBaseUrl(request)}/${(path ?? "").replace(/^\/+/, "")}`;
}

/**
 * Read a route handler body as a plain object. Laravel's `$request->all()`
 * transparently handles JSON and `multipart/form-data`; the `register` and
 * `update_profile_picture` endpoints need the latter for file uploads.
 */
export async function readRequestBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const body: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      body[key] = value;
    }
    return body;
  }

  const parsed = await request.json().catch(() => null);
  return parsed && typeof parsed === "object"
    ? (parsed as Record<string, unknown>)
    : {};
}

/** Laravel's `required|numeric` rule (numeric strings and numbers pass). */
export function isNumeric(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value === "string") {
    return /^-?\d+(\.\d+)?$/.test(value.trim());
  }
  return false;
}
