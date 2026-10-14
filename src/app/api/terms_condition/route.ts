import { NextResponse } from "next/server";

import { jsonSafe } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/terms_condition
 *
 * Laravel `AuthController::getTermsCondition`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const terms = await prisma.business_settings.findFirst({
    where: { type: "terms_condition" },
  });
  if (!terms) {
    return NextResponse.json(
      { status: true, message: "No Terms & Condition found.", data: [] },
      { status: 400 },
    );
  }

  return NextResponse.json({
    status: true,
    message: "Terms & Condition retrieved successfully.",
    data: jsonSafe(terms),
  });
}
