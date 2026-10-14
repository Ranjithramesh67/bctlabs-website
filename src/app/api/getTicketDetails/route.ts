import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import {
  isBlank,
  rawRows,
  ticketImageUrl,
  ticketInterest,
  ticketTableName,
  userDetails,
} from "@/lib/api-tickets";

export const instant = false;

/**
 * POST /api/getTicketDetails
 *
 * Laravel `TicketController::getTicketDetails`. The lookup uses `->get()`, so a
 * missing ticket is never reported as 404: an unmatched id yields an empty
 * `data` array with `status:true`.
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
    `SELECT * FROM ${table} WHERE id = ? AND isDeleted = ?`,
    [body.id, "0"],
  );

  const data: Record<string, unknown>[] = [];
  for (const row of rows) {
    const interest = await ticketInterest(type, row.id, auth.user.id);
    const ticket: Record<string, unknown> = { ...row };
    ticket.imInterested = interest.exists;
    ticket.imInterestedId = interest.id;
    ticket.type = type;
    ticket.ticket_image = ticketImageUrl(request, row.ticket_image);
    ticket.user_details = await userDetails(request, row.user_id);
    data.push(ticket);
  }

  return NextResponse.json({
    status: true,
    message: "Ticket details retrieved successfully.",
    data,
  });
}
