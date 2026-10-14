import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import {
  rawRows,
  ticketImageUrl,
  userDetails,
} from "@/lib/api-tickets";

export const instant = false;

/**
 * POST /api/search-tickets
 *
 * Laravel `TicketController::getSearchTickets`. Results are only returned when
 * `type` is `all` or one of the four concrete types; an absent `type` yields an
 * empty result set.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);

  const type = body.type;
  if (type !== undefined && type !== null && type !== "") {
    if (typeof type !== "string") {
      return NextResponse.json({
        status: false,
        message: "The type field must be a string.",
      });
    }
    if (!["movie", "music", "concert", "sport", "all"].includes(type)) {
      return NextResponse.json({
        status: false,
        message: "The selected type is invalid.",
      });
    }
  }
  if (
    body.searchValue !== undefined &&
    body.searchValue !== null &&
    body.searchValue !== "" &&
    typeof body.searchValue !== "string"
  ) {
    return NextResponse.json({
      status: false,
      message: "The search value field must be a string.",
    });
  }

  const searchValue =
    typeof body.searchValue === "string" ? body.searchValue : "";
  const like = `%${searchValue}%`;
  const hasSearch = searchValue.length > 0;

  const query: Record<string, unknown>[] = [];

  if (type === "movie" || type === "all") {
    const sql =
      "SELECT id, 'movie' AS type, movie_name AS name, theater_name AS venue, movie_date_time AS date_time, " +
      "seat_number_row, screen_number, movie_language AS language, theater_address AS address, city, " +
      "ticket_image, user_id FROM movies WHERE isDeleted = ? AND ticket_status_id = ?" +
      (hasSearch
        ? " AND (movie_name LIKE ? OR theater_name LIKE ? OR city LIKE ?)"
        : "");
    const params: unknown[] = ["0", "1"];
    if (hasSearch) params.push(like, like, like);
    query.push(...(await rawRows(sql, params)));
  }

  if (type === "music" || type === "all") {
    const sql =
      "SELECT id, 'music' AS type, singer_name AS name, concept_name AS venue, concept_date AS date_time, " +
      "null AS seat_number_row, null AS screen_number, null AS language, concept_address AS address, concept_city AS city, " +
      "ticket_image, user_id FROM music WHERE isDeleted = ? AND ticket_status_id = ?" +
      (hasSearch
        ? " AND (singer_name LIKE ? OR concept_name LIKE ? OR concept_city LIKE ?)"
        : "");
    const params: unknown[] = ["0", "1"];
    if (hasSearch) params.push(like, like, like);
    query.push(...(await rawRows(sql, params)));
  }

  if (type === "concert" || type === "all") {
    const sql =
      "SELECT id, 'concert' AS type, speaker_name AS name, concert_name AS venue, concert_date_time AS date_time, " +
      "seat_number_row, null AS screen_number, language, address, city, " +
      "ticket_image, user_id FROM concerts WHERE isDeleted = ? AND ticket_status_id = ?" +
      (hasSearch
        ? " AND (speaker_name LIKE ? OR concert_name LIKE ? OR city LIKE ?)"
        : "");
    const params: unknown[] = ["0", "1"];
    if (hasSearch) params.push(like, like, like);
    query.push(...(await rawRows(sql, params)));
  }

  if (type === "sport" || type === "all") {
    const sql =
      "SELECT id, 'sport' AS type, sports_name AS name, stadium_name AS venue, date_time, " +
      "seat_number_row, null AS screen_number, null AS language, null AS address, city, " +
      "ticket_image, user_id FROM sports WHERE isDeleted = ? AND ticket_status_id = ?" +
      (hasSearch
        ? " AND (sports_name LIKE ? OR stadium_name LIKE ? OR city LIKE ?)"
        : "");
    const params: unknown[] = ["0", "1"];
    if (hasSearch) params.push(like, like, like);
    query.push(...(await rawRows(sql, params)));
  }

  if (query.length === 0) {
    return NextResponse.json({
      status: true,
      message: "No tickets found for this user.",
      data: [],
    });
  }

  const data: Record<string, unknown>[] = [];
  for (const row of query) {
    data.push({
      id: row.id,
      type: row.type,
      name: row.name,
      venue: row.venue,
      date_time: row.date_time,
      seat_number_row: row.seat_number_row,
      screen_number: row.screen_number,
      language: row.language,
      address: row.address,
      city: row.city,
      ticket_image: ticketImageUrl(request, row.ticket_image),
      user_details: await userDetails(request, row.user_id),
    });
  }

  return NextResponse.json({
    status: true,
    message: "Tickets retrieved successfully.",
    data,
  });
}
