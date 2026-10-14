import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";

export const instant = false;

/**
 * GET /api/get/sport/type
 *
 * Laravel `CategoryController::getSportTypeList`. The `SportType` model and its
 * table are absent from the legacy schema, so the query resolves to no rows.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    return NextResponse.json({
      status: true,
      message: "Sport Type fetched successfully.",
      data: [],
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Sport Type.",
    });
  }
}
