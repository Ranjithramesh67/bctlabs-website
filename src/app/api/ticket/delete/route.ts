import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { isBlank, rawExecute, rawRows, ticketTableName } from "@/lib/api-tickets";

export const instant = false;

/**
 * POST /api/ticket/delete
 *
 * Laravel `TicketController::deleteTicket` (soft delete via `isDeleted`).
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);

  let message: string | null = null;
  if (isBlank(body.id)) {
    message = "The id field is required.";
  } else if (isBlank(body.type)) {
    message = "The type field is required.";
  } else if (!["movie", "music", "concert", "sport"].includes(String(body.type))) {
    message = "The selected type is invalid.";
  }
  if (message !== null) {
    return NextResponse.json({ status: false, message });
  }

  const type = String(body.type);
  const table = ticketTableName(type);
  if (!table) {
    return NextResponse.json(
      { status: false, message: "Invalid type specified." },
      { status: 400 },
    );
  }

  const rows = await rawRows(
    `SELECT id FROM ${table} WHERE isDeleted = ? AND id = ? AND user_id = ? AND ticket_status_id = ? LIMIT 1`,
    ["0", body.id, auth.user.id, "1"],
  );

  if (rows.length > 0) {
    await rawExecute(
      `UPDATE ${table} SET isDeleted = ?, deleted_at = ?, deleted_by = ? WHERE id = ?`,
      ["1", new Date(), auth.user.id, body.id],
    );

    return NextResponse.json({
      status: true,
      message: "Ticket was deleted successfully.",
    });
  }

  return NextResponse.json(
    { status: false, message: "Invalid Request." },
    { status: 400 },
  );
}
