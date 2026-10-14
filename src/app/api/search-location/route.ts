import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";

export const instant = false;

type NominatimPlace = {
  display_name?: string;
  lat?: string;
  lon?: string;
  place_id?: number | string;
  address?: Record<string, string>;
};

/**
 * POST /api/search-location
 *
 * Laravel `TicketController::searchLocation` (Nominatim forward geocoding).
 * Any transport failure or non-200 response yields an empty `data` array,
 * exactly like the original.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);
  const query = body.searchValue === undefined ? "" : body.searchValue;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    String(query ?? ""),
  )}&format=json&limit=1&addressdetails=1`;

  const resultArray: Record<string, unknown>[] = [];

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Reaserved Ticket",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 200) {
      const data = (await response.json()) as NominatimPlace[];
      if (Array.isArray(data)) {
        for (const place of data) {
          const address = place.address ?? {};
          const city =
            address.city ?? address.town ?? address.village ?? null;
          const district = address.state_district ?? null;
          const country = address.country ?? null;
          const state = address.state ?? null;

          if (city || district || state) {
            resultArray.push({
              name: place.display_name,
              latitude: String(place.lat),
              longitude: String(place.lon),
              location: `${city ?? ""}, ${district ?? ""}, ${state ?? ""}, ${country ?? ""}`,
              city_name: city,
              district_name: district,
              state_name: state,
              place_id: String(place.place_id),
            });
          }
        }
      }
    }
  } catch {
    // Match the original: failures produce an empty result set.
  }

  return NextResponse.json({
    status: true,
    message: "Location retrieved successfully.",
    data: resultArray,
  });
}
