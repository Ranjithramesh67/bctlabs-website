import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * POST /api/updateLocation
 *
 * Laravel `AuthController::updateLocation`, including the hard-coded state/city
 * fallbacks (`35` / `3659`).
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);
  const required: Array<[string, string]> = [
    ["address", "The address field is required."],
    ["latitude", "The latitude field is required."],
    ["longitude", "The longitude field is required."],
    ["state_name", "The state name field is required."],
    ["city_name", "The city name field is required."],
  ];
  for (const [field, message] of required) {
    if (isMissing(body[field])) {
      return NextResponse.json({ status: false, message });
    }
  }

  const stateName = String(body.state_name);
  const cityName = String(body.city_name);

  const state = await prisma.states.findFirst({ where: { name: stateName } });
  const stateId = state?.id;
  const city = stateId
    ? await prisma.cities.findFirst({
        where: { state_id: stateId, name: cityName },
      })
    : null;

  await prisma.users.update({
    where: { id: auth.user.id },
    data: {
      address: String(body.address),
      state_name: stateName,
      state_id: stateId ?? 35,
      city_name: cityName,
      city_id: city?.id ?? 3659,
      latitude: String(body.latitude),
      longitude: String(body.longitude),
      is_location_verrify: 1,
    },
  });

  return NextResponse.json({
    status: true,
    message: "Location updated successfully.",
  });
}
