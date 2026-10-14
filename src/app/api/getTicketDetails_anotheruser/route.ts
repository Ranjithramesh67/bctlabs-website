import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import {
  isBlank,
  rawRows,
  ticketImageUrl,
  ticketInterest,
  ticketTableName,
} from "@/lib/api-tickets";

export const instant = false;

/**
 * POST /api/getTicketDetails_anotheruser
 *
 * Laravel `TicketController::getTicketDetails_anotheruser`. This route is
 * registered OUTSIDE the `auth:sanctum` group, so it is public; `auth()->user()`
 * is therefore always null and the interest lookup runs with `user_id is null`.
 */
export async function POST(request: Request) {
  const body = await readRequestBody(request);

  // Rules are declared in this order: id, type.
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

  const rows = await rawRows(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [
    body.id,
  ]);
  const ticket = rows[0];
  if (!ticket) {
    return NextResponse.json(
      {
        status: false,
        message: "Ticket not found or does not belong to this user.",
      },
      { status: 404 },
    );
  }

  const interest = await ticketInterest(type, ticket.id, null);

  return NextResponse.json({
    status: true,
    message: "Ticket details retrieved successfully.",
    data: {
      ...ticket,
      ticket_image: ticketImageUrl(request, ticket.ticket_image),
      imInterested: interest.exists,
      imInterestedId: interest.id,
    },
  });
}
