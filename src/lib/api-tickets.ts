import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { jsonSafe, laravelDate, laravelUrl, readRequestBody } from "./api-format";
import { serializeUser } from "./api-users";
import { prisma } from "./prisma";

/**
 * Helpers shared by the ticket / support-ticket / booking-ticket routes.
 *
 * The original Laravel app backs its `Movie` / `Music` / `Concert` / `Sport`
 * ticket models with four separate tables that are not part of the Prisma
 * schema, so those routes talk to them through raw SQL using the same table
 * and column names the controller used.
 */

export const TICKET_TYPES = ["movie", "music", "concert", "sport"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

const TICKET_TABLES: Record<TicketType, string> = {
  movie: "movies",
  music: "music",
  concert: "concerts",
  sport: "sports",
};

export function isTicketType(value: unknown): value is TicketType {
  return (
    typeof value === "string" &&
    (TICKET_TYPES as readonly string[]).includes(value)
  );
}

/** Table name for a ticket type, or `null` when the type is unknown. */
export function ticketTableName(type: string): string | null {
  return isTicketType(type) ? TICKET_TABLES[type] : null;
}

// ---------------------------------------------------------------------------
// Raw query plumbing
// ---------------------------------------------------------------------------

// The MariaDB driver adapter returns TIMESTAMP/DATETIME columns as ISO strings
// with a `+00:00` suffix. Laravel serialises Carbon dates with microsecond
// precision (`...T..:..:..000000Z`), so re-normalise before responding.
const RAW_SQL_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(\+00:00|Z)$/;

function normalizeRawValue(value: unknown): unknown {
  if (typeof value === "string" && RAW_SQL_DATE.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return laravelDate(parsed);
    }
  }
  return value;
}

function normalizeRawRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = normalizeRawValue(value);
  }
  return out;
}

export async function rawRows(
  sql: string,
  params: unknown[],
): Promise<Record<string, unknown>[]> {
  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    sql,
    ...params,
  );
  return rows.map(normalizeRawRow);
}

export async function rawExecute(
  sql: string,
  params: unknown[],
): Promise<number> {
  return prisma.$executeRawUnsafe(sql, ...params);
}

/** Laravel's `$baseUrl.'/'.$ticket->ticket_image`. */
export function ticketImageUrl(request: Request, relative: unknown): string {
  if (relative === null || relative === undefined) {
    return laravelUrl(request, null);
  }
  return laravelUrl(request, String(relative));
}

/** Eloquent's `User::find(...)->toArray()` for a ticket's `user_details`. */
export async function userDetails(
  request: Request,
  userId: unknown,
): Promise<Record<string, unknown> | null> {
  if (userId === null || userId === undefined) {
    return null;
  }
  const user = await prisma.users.findUnique({
    where: { id: Number(userId) },
  });
  return user ? serializeUser(request, user) : null;
}

export type Interest = { exists: boolean; id: number };

/** `TicketBooking::where(...)->exists()` + `->pluck('id')->first()`. */
export async function ticketInterest(
  type: string,
  ticketId: unknown,
  userId: number | null,
): Promise<Interest> {
  const rows = await rawRows(
    "SELECT id FROM ticket_booking WHERE ticket_type = ? AND ticket_id = ? AND " +
      (userId === null ? "user_id IS NULL" : "user_id = ?") +
      " ORDER BY id ASC LIMIT 1",
    userId === null ? [type, ticketId] : [type, ticketId, userId],
  );
  return rows.length > 0
    ? { exists: true, id: Number(rows[0].id) }
    : { exists: false, id: 0 };
}

// ---------------------------------------------------------------------------
// Uploaded files (Laravel's `storeFileToPublic`)
// ---------------------------------------------------------------------------

/** `time() . '_' . $file->getClientOriginalName()` moved into `public/<dir>`. */
export async function storePublicFile(
  file: File,
  directory: string,
): Promise<string> {
  const fileName = `${Math.floor(Date.now() / 1000)}_${file.name}`;
  const targetDir = join(process.cwd(), "public", directory);
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, fileName), Buffer.from(await file.arrayBuffer()));
  return `${directory}/${fileName}`;
}

/**
 * Laravel's `$request->all()` plus the `image` / `image[]` uploaded files. The
 * support-ticket forms submit the images as an array, which the generic
 * `readRequestBody` would collapse to the last entry.
 */
export async function readUploadBody(
  request: Request,
): Promise<{ body: Record<string, unknown>; images: File[] }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const body: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      if (value instanceof File) {
        continue;
      }
      body[key] = value;
    }
    const images = [
      ...form.getAll("image"),
      ...form.getAll("image[]"),
    ].filter((value): value is File => value instanceof File);
    return { body, images };
  }

  return { body: await readRequestBody(request), images: [] };
}

// ---------------------------------------------------------------------------
// SupportTicket / SupportTicketConv attachments
// ---------------------------------------------------------------------------

/** Decode the JSON `attachment` column Eloquent casts to an array. */
export function attachmentList(raw: unknown): string[] {
  if (typeof raw !== "string" || raw.length === 0) {
    return [];
  }
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

/** Laravel's `getAttachmentFullUrlAttribute()` accessor. */
export function attachmentFullUrl(raw: unknown): string[] {
  return attachmentList(raw).map(
    (item) =>
      `https://reservedtickets.in/${item.replace(/\\/g, "/").replace(/^\/+/, "")}`,
  );
}

/** Replace the hidden `attachment` column with the appended `attachment_full_url`. */
export function withAttachmentFullUrl(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const { attachment, ...rest } = row;
  return { ...rest, attachment_full_url: attachmentFullUrl(attachment) };
}

/** Laravel's `ConvertEmptyStringsToNull` middleware, applied where it matters. */
export function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

export { jsonSafe, laravelDate, laravelUrl };
