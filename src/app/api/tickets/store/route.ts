import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { isBlank, rawExecute, rawRows, ticketTableName, type TicketType } from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

type Rule = "required-string" | "required" | "nullable-string" | "required-image";
type Spec = { field: string; rule: Rule };

const SPECS: Record<TicketType, Spec[]> = {
  movie: [
    { field: "movie_name", rule: "required-string" },
    { field: "theater_name", rule: "required-string" },
    { field: "movie_date_time", rule: "required" },
    { field: "seat_number_row", rule: "required-string" },
    { field: "screen_number", rule: "required-string" },
    { field: "movie_language", rule: "required-string" },
    { field: "theater_address", rule: "required-string" },
    { field: "city", rule: "nullable-string" },
    { field: "city_id", rule: "required-string" },
    { field: "state_id", rule: "required-string" },
    { field: "ticket_per_price", rule: "required-string" },
    { field: "ticket_total_price", rule: "required-string" },
    { field: "is_visible_contact_number", rule: "required-string" },
    { field: "tickets_sold", rule: "required-string" },
    { field: "ticket_price", rule: "nullable-string" },
    { field: "ticket_code", rule: "required-string" },
    { field: "ticket_image", rule: "required-image" },
  ],
  music: [
    { field: "singer_name", rule: "required-string" },
    { field: "concept_name", rule: "required-string" },
    { field: "concept_date", rule: "required-string" },
    { field: "concept_time", rule: "required-string" },
    { field: "concept_address", rule: "required-string" },
    { field: "concept_city", rule: "nullable-string" },
    { field: "city_id", rule: "required-string" },
    { field: "state_id", rule: "required-string" },
    { field: "ticket_per_price", rule: "required-string" },
    { field: "ticket_total_price", rule: "required-string" },
    { field: "is_visible_contact_number", rule: "required-string" },
    { field: "tickets_sold", rule: "required-string" },
    { field: "ticket_price", rule: "nullable-string" },
    { field: "ticket_code", rule: "required-string" },
    { field: "ticket_image", rule: "required-image" },
  ],
  concert: [
    { field: "speaker_name", rule: "required-string" },
    { field: "concert_name", rule: "required-string" },
    { field: "concert_date_time", rule: "required" },
    { field: "seat_number_row", rule: "required-string" },
    { field: "language", rule: "required-string" },
    { field: "address", rule: "required-string" },
    { field: "city", rule: "nullable-string" },
    { field: "city_id", rule: "required-string" },
    { field: "state_id", rule: "required-string" },
    { field: "ticket_per_price", rule: "required-string" },
    { field: "ticket_total_price", rule: "required-string" },
    { field: "is_visible_contact_number", rule: "required-string" },
    { field: "tickets_sold", rule: "required-string" },
    { field: "ticket_price", rule: "nullable-string" },
    { field: "ticket_code", rule: "required-string" },
    { field: "ticket_image", rule: "required-image" },
  ],
  sport: [
    { field: "sports_name", rule: "required-string" },
    { field: "match_name", rule: "required-string" },
    { field: "team", rule: "required-string" },
    { field: "stadium_name", rule: "required-string" },
    { field: "date_time", rule: "required" },
    { field: "seat_number_row", rule: "required-string" },
    { field: "gate_number", rule: "required-string" },
    { field: "stand_name", rule: "required-string" },
    { field: "city", rule: "nullable-string" },
    { field: "city_id", rule: "required-string" },
    { field: "state_id", rule: "required-string" },
    { field: "ticket_per_price", rule: "required-string" },
    { field: "ticket_total_price", rule: "required-string" },
    { field: "is_visible_contact_number", rule: "required-string" },
    { field: "tickets_sold", rule: "required-string" },
    { field: "ticket_price", rule: "nullable-string" },
    { field: "ticket_code", rule: "required-string" },
    { field: "ticket_image", rule: "required-image" },
  ],
};

const PREFIXES: Record<TicketType, string> = {
  movie: "MOV",
  music: "MUS",
  concert: "CON",
  sport: "SPO",
};

const MESSAGES: Record<TicketType, string> = {
  movie: "Movie ticket saved successfully.",
  music: "Music ticket saved successfully.",
  concert: "Concert ticket saved successfully.",
  sport: "Sport ticket saved successfully.",
};

function label(field: string): string {
  return field.replace(/_/g, " ");
}

/** `$request->all()` while keeping the uploaded `File` in place. */
async function readStoreBody(
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
  return readRequestBody(request);
}

function validate(specs: Spec[], body: Record<string, unknown>): string | null {
  for (const { field, rule } of specs) {
    const value = body[field];
    const name = label(field);
    if (rule === "required-image") {
      if (!(value instanceof File)) {
        if (isBlank(value)) return `The ${name} field is required.`;
        return `The ${name} field must be an image.`;
      }
      if (!value.type.startsWith("image/")) {
        return `The ${name} field must be an image.`;
      }
      continue;
    }
    if (rule === "required" || rule === "required-string") {
      if (isBlank(value)) return `The ${name} field is required.`;
      if (rule === "required-string" && typeof value !== "string") {
        return `The ${name} field must be a string.`;
      }
      continue;
    }
    // nullable-string
    if (!isBlank(value) && typeof value !== "string") {
      return `The ${name} field must be a string.`;
    }
  }
  return null;
}

async function generateTicketId(code: string): Promise<string> {
  for (;;) {
    const ticketId = `${code}${Math.floor(Math.random() * 9000000) + 1000000}`;
    const rows = await rawRows(
      "SELECT ticket_id FROM movies WHERE ticket_id = ? UNION SELECT ticket_id FROM music WHERE ticket_id = ? " +
        "UNION SELECT ticket_id FROM concerts WHERE ticket_id = ? UNION SELECT ticket_id FROM sports WHERE ticket_id = ? LIMIT 1",
      [ticketId, ticketId, ticketId, ticketId],
    );
    if (rows.length === 0) {
      return ticketId;
    }
  }
}

/** `uniqid().'.'.$file->getClientOriginalExtension()` saved under `uploads/ticket_images/`. */
async function storeTicketImage(file: File): Promise<string> {
  const extension = extname(file.name || "").toLowerCase();
  const fileName = `${Date.now().toString(16)}${randomBytes(2).toString("hex")}${extension}`;
  const directory = join(process.cwd(), "public", "uploads", "ticket_images");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, fileName), Buffer.from(await file.arrayBuffer()));
  return `uploads/ticket_images/${fileName}`;
}

/**
 * POST /api/tickets/store
 *
 * Laravel `TicketController::store`. An unknown `type` skips validation and
 * falls through to the "Invalid type specified." response.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readStoreBody(request);
  const type = body.type;

  if (typeof type === "string" && ticketTableName(type)) {
    const ticketType = type as TicketType;
    const message = validate(SPECS[ticketType], body);
    if (message !== null) {
      return NextResponse.json({ status: false, message });
    }

    const data: Record<string, unknown> = {};
    for (const { field } of SPECS[ticketType]) {
      data[field] = body[field] ?? null;
    }
    if (body.ticket_image instanceof File) {
      data.ticket_image = await storeTicketImage(body.ticket_image);
    }

    const cityName = !isBlank(body.city_id)
      ? ((await prisma.cities.findUnique({
          where: { id: Number(body.city_id) },
        }))?.name ?? "")
      : "";
    const stateName = !isBlank(body.state_id)
      ? ((await prisma.states.findUnique({
          where: { id: Number(body.state_id) },
        }))?.name ?? "")
      : "";

    data.ticket_id = await generateTicketId(PREFIXES[ticketType]);
    data.user_id = auth.user.id;
    data.state_name = stateName;
    if (ticketType === "music") {
      data.concept_city = cityName;
    } else {
      data.city = cityName;
    }

    const table = ticketTableName(ticketType)!;
    const columns = Object.keys(data);
    const placeholders = columns.map(() => "?").join(", ");
    await rawExecute(
      `INSERT INTO ${table} (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES (${placeholders})`,
      columns.map((c) => data[c]),
    );

    const rows = await rawRows(
      `SELECT * FROM ${table} WHERE ticket_id = ? LIMIT 1`,
      [data.ticket_id],
    );

    return NextResponse.json({
      status: true,
      message: MESSAGES[ticketType],
      data: rows[0] ?? data,
    });
  }

  return NextResponse.json({
    status: false,
    message: "Invalid type specified.",
  });
}
