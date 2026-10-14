import { NextResponse } from "next/server";

import { jsonSafe } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/refund_policy
 *
 * Laravel `AuthController::getRefundPolicy`. Note the setting type uses a
 * hyphen (`refund-policy`), matching the original query.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const refund = await prisma.business_settings.findFirst({
    where: { type: "refund-policy" },
  });
  if (!refund) {
    return NextResponse.json(
      { status: true, message: "No Refund & Policy found.", data: [] },
      { status: 400 },
    );
  }

  return NextResponse.json({
    status: true,
    message: "Refund & Policy retrieved successfully.",
    data: jsonSafe(refund),
  });
}
