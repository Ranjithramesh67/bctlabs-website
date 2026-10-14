import { NextResponse } from "next/server";

import { jsonSafe, readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { isBlank } from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/ticket/insterest
 *
 * Laravel `TicketController::bookingTickets` (the endpoint is spelled
 * "insterest" in the route file). The booking row is created if missing.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);

  let message: string | null = null;
  if (isBlank(body.ticket_id)) {
    message = "The ticket id field is required.";
  } else if (isBlank(body.seller_id)) {
    message = "The seller id field is required.";
  } else if (isBlank(body.type)) {
    message = "The type field is required.";
  } else if (!["movie", "music", "concert", "sport"].includes(String(body.type))) {
    message = "The selected type is invalid.";
  }
  if (message !== null) {
    return NextResponse.json({ status: false, message });
  }

  const ticketId = Number(body.ticket_id);
  const sellerId = Number(body.seller_id);
  const type = String(body.type);

  let booking = await prisma.ticket_booking.findFirst({
    where: {
      user_id: auth.user.id,
      seller_id: sellerId,
      ticket_id: ticketId,
      ticket_type: type,
    },
  });

  if (!booking) {
    const now = new Date();
    booking = await prisma.ticket_booking.create({
      data: {
        user_id: auth.user.id,
        seller_id: sellerId,
        ticket_id: ticketId,
        ticket_type: type,
        created_at: now,
        updated_at: now,
      },
    });
  }

  return NextResponse.json({
    status: true,
    message: "Success",
    data: jsonSafe(booking),
  });
}
