import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import {
  TICKET_TYPES,
  type TicketType,
  isBlank,
  rawRows,
  ticketImageUrl,
  ticketInterest,
  ticketTableName,
  userDetails,
} from "@/lib/api-tickets";

export const instant = false;

/**
 * POST /api/getTickets
 *
 * Laravel `TicketController::getTickets`. The response `data` is the ticket
 * models themselves (with `type`, `ticket_image`, `user_details`, `viewCount`
 * and `imInterested` appended). Note the controller computes `imInterested`
 * against `ticket_type = "sport"` regardless of the ticket's real type.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);

  if (!isBlank(body.type)) {
    if (typeof body.type !== "string") {
      return NextResponse.json({
        status: false,
        message: "The type field must be a string.",
      });
    }
    if (
      !["movie", "music", "concert", "sport", "all"].includes(body.type)
    ) {
      return NextResponse.json({
        status: false,
        message: "The selected type is invalid.",
      });
    }
  }

  const typesToFetch: TicketType[] = isBlank(body.type)
    ? [...TICKET_TYPES]
    : body.type === "all"
      ? [...TICKET_TYPES]
      : [body.type as TicketType];

  const collected: { type: TicketType; row: Record<string, unknown> }[] = [];
  for (const type of typesToFetch) {
    const table = ticketTableName(type)!;
    const rows = await rawRows(
      `SELECT * FROM ${table} WHERE isDeleted = ? AND ticket_status_id = ?`,
      ["0", "1"],
    );
    for (const row of rows) {
      collected.push({ type, row });
    }
  }

  if (collected.length === 0) {
    return NextResponse.json({
      status: true,
      message: "No tickets found for this user.",
      data: [],
    });
  }

  const data: Record<string, unknown>[] = [];
  for (const { type, row } of collected) {
    const ticket: Record<string, unknown> = { ...row };
    ticket.type = type;
    ticket.ticket_image = ticketImageUrl(request, row.ticket_image);
    ticket.user_details = await userDetails(request, row.user_id);
    ticket.viewCount = 0;
    // Faithful to the controller: interest is always looked up as "sport".
    ticket.imInterested = (
      await ticketInterest("sport", row.id, auth.user.id)
    ).exists;
    data.push(ticket);
  }

  return NextResponse.json({
    status: true,
    message: "Tickets retrieved successfully.",
    data,
  });
}
