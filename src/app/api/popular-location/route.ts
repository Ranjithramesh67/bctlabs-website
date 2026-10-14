import { NextResponse } from "next/server";

import { jsonSafe } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/popular-location
 *
 * Laravel `TicketController::popularLocation`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const popularLocation = await prisma.popular_location.findMany({
    where: { status: 1 },
    select: {
      location: true,
      latitude: true,
      longitude: true,
      state_name: true,
      city_name: true,
    },
  });

  return NextResponse.json({
    status: true,
    message: "Popular Location retrieved successfully.",
    data: jsonSafe(popularLocation),
  });
}
