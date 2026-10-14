import { NextResponse } from "next/server";

import { serializeCommerce } from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/state-list
 *
 * Laravel `CategoryController::getStateList`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const states = await prisma.states.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({
      status: true,
      message: "State Data fetched successfully.",
      data: serializeCommerce(states),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Sport Type.",
    });
  }
}
