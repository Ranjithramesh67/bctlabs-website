import { NextResponse } from "next/server";

import { serializeCommerce } from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/city-list/{id}
 *
 * Laravel `CategoryController::getCityList`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const stateId = /^-?\d+$/.test(id) ? Number(id) : null;
    const cities =
      stateId === null
        ? []
        : await prisma.cities.findMany({
            where: { state_id: stateId },
            orderBy: { id: "asc" },
          });

    return NextResponse.json({
      status: true,
      message: "City Data fetched successfully.",
      data: serializeCommerce(cities),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch City data.",
    });
  }
}
