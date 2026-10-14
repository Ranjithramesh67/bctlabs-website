import "server-only";

import { unlink, mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { Prisma } from "@/generated/prisma/client";
import { appBaseUrl, laravelDate, laravelUrl, readRequestBody } from "./api-format";

/**
 * Deep-serialise a Prisma result the way Laravel's `Model::toArray()` serialises
 * Eloquent models:
 *  - `BigInt` keys/counters become numbers,
 *  - `Date` values become microsecond ISO-8601 strings,
 *  - MySQL `DECIMAL` columns stay strings with their scale preserved (`120.00`).
 *
 * Prisma hands `DECIMAL` columns back as `Prisma.Decimal` objects; their default
 * JSON encoding normalises trailing zeros away (`120`), which would differ from
 * Laravel, so they are rendered with two decimal places instead.
 */
export function serializeCommerce(value: unknown): unknown {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value instanceof Date) {
    return laravelDate(value);
  }
  if (Prisma.Decimal.isDecimal(value)) {
    return (value as InstanceType<typeof Prisma.Decimal>).toFixed(2);
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeCommerce(item));
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = serializeCommerce(item);
    }
    return result;
  }
  return value;
}

/**
 * Laravel's `Request::all()` for the endpoints that accept any verb: query
 * string values are the input source for `GET`, while `POST` merges the request
 * body on top of the query string (`getInputSource()->all() + query->all()`).
 */
export async function readCommerceInput(
  request: Request,
): Promise<Record<string, unknown>> {
  const query: Record<string, unknown> = {};
  new URL(request.url).searchParams.forEach((value, key) => {
    query[key] = normalizeLaravelInput(value);
  });

  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return query;
  }

  const body = await readCommerceBody(request);
  return { ...query, ...body };
}

/**
 * Apply Laravel's global `TrimStrings` + `ConvertEmptyStringsToNull` middleware
 * to a request body: every string value (recursively) is trimmed, and strings
 * that end up empty become `null`.
 */
export async function readCommerceBody(
  request: Request,
): Promise<Record<string, unknown>> {
  return normalizeLaravelInput(await readRequestBody(request)) as Record<
    string,
    unknown
  >;
}

/** Recursive worker for `readCommerceBody` / `readCommerceInput`. */
export function normalizeLaravelInput(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeLaravelInput(item));
  }
  if (value instanceof File) {
    return value;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = normalizeLaravelInput(item);
    }
    return result;
  }
  if (typeof value === "string") {
    const trimmed = value.replace(
      /^[\s\ufeff\u200b]+|[\s\ufeff\u200b]+$/gu,
      "",
    );
    return trimmed === "" ? null : trimmed;
  }
  return value;
}

/** Laravel's `$file->move(public_path($directory), time().'_'.$name)`. */
export async function storeFileToPublic(
  file: File,
  directory: string,
): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Math.floor(Date.now() / 1000)}_${basename(file.name || "file")}`;
  const targetDir = join(process.cwd(), "public", directory);
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, fileName), bytes);
  return `${directory}/${fileName}`;
}

/** Laravel's `deleteFileFromPublic()` used when replacing an upload. */
export async function deleteFileFromPublic(
  relativePath: string | null | undefined,
): Promise<void> {
  if (!relativePath) {
    return;
  }
  try {
    await unlink(join(process.cwd(), "public", relativePath));
  } catch {
    // Missing files are ignored, matching `file_exists()` guarding `unlink()`.
  }
}

/** Laravel's blank detection for the `required` rule. */
export function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim() === "";
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

/** Laravel's `Request::filled()`: present and not blank. */
export function isFilled(value: unknown): boolean {
  return !isBlank(value);
}

/** Laravel's `FILTER_VALIDATE_INT` used by the `integer` rule. */
export function isInteger(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isInteger(value);
  }
  if (typeof value === "string") {
    return /^-?\d+$/.test(value.trim());
  }
  return false;
}

/** Laravel's `is_numeric()` used by the `numeric` rule. */
export function isNumericLaravel(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return false;
    }
    return !Number.isNaN(Number(trimmed));
  }
  return false;
}

/** Numeric value as a JS number (callers ensure `isNumericLaravel`). */
export function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(String(value).trim());
}

/** Laravel's `getDisplayableAttribute()`: underscores/dashes become spaces. */
export function laravelAttr(name: string): string {
  return name.replace(/[_-]/g, " ");
}

export const validationMsg = {
  required: (attr: string) => `The ${laravelAttr(attr)} field is required.`,
  string: (attr: string) => `The ${laravelAttr(attr)} field must be a string.`,
  maxChars: (attr: string, max: number) =>
    `The ${laravelAttr(attr)} field must not be greater than ${max} characters.`,
  integer: (attr: string) => `The ${laravelAttr(attr)} field must be an integer.`,
  numeric: (attr: string) => `The ${laravelAttr(attr)} field must be a number.`,
  minNumeric: (attr: string, min: number) =>
    `The ${laravelAttr(attr)} field must be at least ${min}.`,
  minArray: (attr: string, min: number) =>
    `The ${laravelAttr(attr)} field must have at least ${min} items.`,
  array: (attr: string) => `The ${laravelAttr(attr)} field must be an array.`,
  url: (attr: string) => `The ${laravelAttr(attr)} field must be a valid URL.`,
  image: (attr: string) => `The ${laravelAttr(attr)} field must be an image.`,
  mimes: (attr: string, values: string) =>
    `The ${laravelAttr(attr)} field must be a file of type: ${values}.`,
  maxFile: (attr: string, kilobytes: number) =>
    `The ${laravelAttr(attr)} field must not be greater than ${kilobytes} kilobytes.`,
  exists: (attr: string) => `The selected ${laravelAttr(attr)} is invalid.`,
  unique: (attr: string) =>
    `The ${laravelAttr(attr)} has already been taken.`,
  boolean: (attr: string) =>
    `The ${laravelAttr(attr)} field must be true or false.`,
  date: (attr: string) => `The ${laravelAttr(attr)} field must be a valid date.`,
  beforeOrEqual: (attr: string, date: string) =>
    `The ${laravelAttr(attr)} field must be a date before or equal to ${date}.`,
  afterOrEqual: (attr: string, date: string) =>
    `The ${laravelAttr(attr)} field must be a date after or equal to ${date}.`,
};

/** Laravel's `image` rule (jpeg/png/gif/bmp/svg/webp by mime type). */
export function isImageFile(value: unknown): boolean {
  if (!(value instanceof File)) {
    return false;
  }
  return /^image\//i.test(value.type);
}

/** Laravel's `mimes:` rule, checked against the original file name extension. */
export function hasMime(value: unknown, mimes: string[]): boolean {
  if (!(value instanceof File)) {
    return false;
  }
  const name = (value.name || "").toLowerCase();
  const extension = name.includes(".")
    ? name.slice(name.lastIndexOf(".") + 1)
    : "";
  return mimes.map((item) => item.toLowerCase()).includes(extension);
}

/** Laravel's `max:` rule for an uploaded file (kilobytes). */
export function fileWithinKb(value: unknown, kilobytes: number): boolean {
  if (!(value instanceof File)) {
    return false;
  }
  return value.size <= kilobytes * 1024;
}

/** Laravel's `FILTER_VALIDATE_URL`. */
export function isValidUrl(value: unknown): boolean {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Laravel's `date` rule: a string PHP can parse as a date. */
export function isValidDate(value: unknown): boolean {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

/** Integer form of a route parameter, or `null` when it is not numeric. */
export function routeId(value: string): number | null {
  return /^-?\d+$/.test(value) ? Number(value) : null;
}

/**
 * MySQL `tinyint(1)` columns that Eloquent does not cast to boolean are handed
 * back as `0`/`1` by Laravel, while Prisma maps them to `true`/`false`.
 */
export function tinyintAsInt(value: boolean | null): number | null {
  return value === null ? null : value ? 1 : 0;
}

/**
 * MySQL casts any non-numeric string to `0` when writing a `tinyint(1)` column,
 * so mirror that when a request value (e.g. `"0"`, `"true"`, `1`) is persisted.
 */
export function laravelTinyintBool(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric !== 0 : false;
  }
  return false;
}

/** Laravel's `boolean` rule: `true`, `false`, `0`, `1`, `"0"`, `"1"`. */
export function isBooleanLaravel(value: unknown): boolean {
  return (
    value === true ||
    value === false ||
    value === 0 ||
    value === 1 ||
    value === "0" ||
    value === "1"
  );
}

/**
 * Laravel's `url()` helper applied straight to a model attribute. When the path
 * is `null`, the helper returns the `UrlGenerator` instance itself; with only
 * protected properties it JSON-encodes to an empty object `{}`. Several legacy
 * controllers assign photo columns this way without a null guard.
 */
export function urlAttribute(
  request: Request,
  path: string | null | undefined,
): unknown {
  if (path === null || path === undefined) {
    return {};
  }
  if (path === "") {
    return appBaseUrl(request);
  }
  return laravelUrl(request, path);
}

/**
 * PHP's loose `$string > $number` comparison, used by the controllers that run
 * a `where('stock', '>', 0)` filter over the varchar `stock` column through a
 * Collection. Numeric strings compare numerically; a non-numeric string is
 * compared against the stringified number (PHP 8 semantics).
 */
export function phpStringGreaterThan(value: string, number: number): boolean {
  const trimmed = value.trim();
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
    return Number(trimmed) > number;
  }
  return value > String(number);
}
