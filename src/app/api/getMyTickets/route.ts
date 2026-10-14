import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { serializeUser } from "@/lib/api-users";
import {
  TICKET_TYPES,
  type TicketType,
  isBlank,
  rawRows,
  ticketImageUrl,
  ticketInterest,
  ticketTableName,
} from "@/lib/api-tickets";

export const instant = false;

/**
 * POST /api/getMyTickets
 *
 * Laravel `TicketController::getMyTickets`. Unlike `getTickets` this builds the
 * response explicitly, and `userData` is the authenticated user (not the
 * ticket owner).
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);

  let typesToFetch: TicketType[];
  if (isBlank(body.type)) {
    typesToFetch = [...TICKET_TYPES];
  } else if (body.type === "all") {
    typesToFetch = [...TICKET_TYPES];
  } else if (
    typeof body.type === "string" &&
    (TICKET_TYPES as readonly string[]).includes(body.type)
  ) {
    typesToFetch = [body.type as TicketType];
  } else {
    return NextResponse.json(
      { status: false, message: "Invalid type specified." },
      { status: 400 },
    );
  }

  const collected: { type: TicketType; row: Record<string, unknown> }[] = [];
  for (const type of typesToFetch) {
    const table = ticketTableName(type)!;
    const rows = await rawRows(
      `SELECT * FROM ${table} WHERE user_id = ? AND isDeleted = ?`,
      [auth.user.id, "0"],
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

  const userData = await serializeUser(request, auth.user);
  const data: Record<string, unknown>[] = [];

  for (const { type, row } of collected) {
    const interest = await ticketInterest(type, row.id, auth.user.id);
    const item: Record<string, unknown> = {
      id: row.id,
      ticketType: type,
      viewCount: 0,
      userId: row.user_id,
      ticketId: row.ticket_id,
      cityName: type === "music" ? row.concept_city : row.city,
      stateName: row.state_name,
      ticketPerPrice: row.ticket_per_price,
      ticketTotalPrice: row.ticket_total_price,
      ticketSold: row.tickets_sold,
      ticketPrice: row.ticket_price,
      ticketCode: row.ticket_code,
      ticketImage: ticketImageUrl(request, row.ticket_image),
      createAt: row.created_at,
      status: row.status,
      ticketStatusId: row.ticket_status_id,
      visibleContact: row.is_visible_contact_number,
      isSold: row.isSold,
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
      item.title = row.speaker_name;
      item.ticketName = row.concept_name;
      item.ticketDate = row.concert_date_time;
      item.seatNumberRow = row.seat_number_row;
      item.address = row.address;
      item.language = row.language;
    } else if (type === "music") {
      item.title = row.singer_name;
      item.ticketName = row.concert_name;
      item.ticketDate = `${row.concept_date ?? ""} ${row.concept_time ?? ""}`;
      item.address = row.concept_address;
    } else if (type === "movie") {
      item.title = row.movie_name;
      item.ticketName = row.theater_name;
      item.ticketDate = row.movie_date_time;
      item.seatNumberRow = row.seat_number_row;
      item.language = row.movie_language;
      item.screen_number = row.screen_number;
    } else if (type === "sport") {
      item.title = row.sports_name;
      item.ticketName = row.match_name;
      item.ticketDate = row.date_time;
      item.seatNumberRow = row.seat_number_row;
      item.team = row.team;
      item.stadium_name = row.stadium_name;
      item.gate_number = row.gate_number;
      item.stand_name = row.stand_name;
    }

    data.push(item);
  }

  return NextResponse.json({
    status: true,
    message: "Tickets retrieved successfully.",
    data,
  });
}
