import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { serializeUser } from "@/lib/api-users";
import {
  rawRows,
  ticketImageUrl,
  ticketInterest,
  ticketTableName,
} from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/ticket/booking-list
 *
 * Laravel `TicketController::mybookingTickets`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const bookings = await prisma.ticket_booking.findMany({
    where: { user_id: auth.user.id },
  });

  if (bookings.length === 0) {
    return NextResponse.json({
      status: true,
      message: "No bookings found for this user.",
      data: [],
    });
  }

  const userData = await serializeUser(request, auth.user);
  const ticketArray: Record<string, unknown>[] = [];

  for (const booking of bookings) {
    const type = String(booking.ticket_type ?? "");
    const table = ticketTableName(type);
    if (!table) {
      // Unknown types are skipped (`continue 2` in the controller).
      continue;
    }

    const rows = await rawRows(
      `SELECT * FROM ${table} WHERE id = ? AND isDeleted = ? LIMIT 1`,
      [booking.ticket_id, "0"],
    );
    const ticket = rows[0];
    if (!ticket) {
      // The controller removed its null guard, so a missing ticket throws.
      throw new Error("Ticket not found");
    }

    const interest = await ticketInterest(type, ticket.id, auth.user.id);

    const item: Record<string, unknown> = {
      id: ticket.id,
      ticketType: type,
      viewCount: 0,
      userId: ticket.user_id ?? null,
      ticketId: booking.ticket_id,
      cityName:
        type === "music"
          ? (ticket.concept_city ?? null)
          : (ticket.city ?? null),
      stateName: ticket.state_name ?? null,
      ticketPerPrice: ticket.ticket_per_price ?? null,
      ticketTotalPrice: ticket.ticket_total_price ?? null,
      ticketSold: ticket.tickets_sold ?? null,
      ticketPrice: ticket.ticket_price ?? null,
      ticketCode: ticket.ticket_code ?? null,
      ticketImage: ticket.ticket_image
        ? ticketImageUrl(request, ticket.ticket_image)
        : null,
      createAt: ticket.created_at ?? null,
      status: ticket.status ?? null,
      ticketStatusId: ticket.ticket_status_id ?? null,
      visibleContact: ticket.is_visible_contact_number ?? null,
      isSold: ticket.isSold ?? null,
      seatNumberRow: "",
      address: "",
      language: "",
      screen_number: "",
      team: "",
      stadium_name: "",
      gate_number: "",
      stand_name: "",
      userData,
      imInterested: interest.exists,
      imInterestedId: interest.id,
    };

    if (type === "concert") {
      item.title = ticket.speaker_name ?? null;
      item.ticketName = ticket.concept_name ?? null;
      item.ticketDate = ticket.concert_date_time ?? null;
      item.seatNumberRow = ticket.seat_number_row ?? null;
      item.address = ticket.address ?? null;
      item.language = ticket.language ?? null;
    } else if (type === "music") {
      item.title = ticket.singer_name ?? null;
      item.ticketName = ticket.concert_name ?? null;
      item.ticketDate = `${ticket.concept_date ?? ""} ${ticket.concept_time ?? ""}`;
      item.address = ticket.concept_address ?? null;
    } else if (type === "movie") {
      item.title = ticket.movie_name ?? null;
      item.ticketName = ticket.theater_name ?? null;
      item.ticketDate = ticket.movie_date_time ?? null;
      item.seatNumberRow = ticket.seat_number_row ?? null;
      item.language = ticket.movie_language ?? null;
      item.screen_number = ticket.screen_number ?? null;
    } else if (type === "sport") {
      item.title = ticket.sports_name ?? null;
      item.ticketName = ticket.match_name ?? null;
      item.ticketDate = ticket.date_time ?? null;
      item.seatNumberRow = ticket.seat_number_row ?? null;
      item.team = ticket.team ?? null;
      item.stadium_name = ticket.stadium_name ?? null;
      item.gate_number = ticket.gate_number ?? null;
      item.stand_name = ticket.stand_name ?? null;
    }

    ticketArray.push(item);
  }

  return NextResponse.json({
    status: true,
    message: "Booking details retrieved successfully.",
    data: ticketArray,
  });
}
