import { NextResponse } from "next/server";

import { jsonSafe } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/privacy_policy
 *
 * Laravel `AuthController::getPrivacyPolicy`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const privacy = await prisma.business_settings.findFirst({
    where: { type: "privacy_policy" },
  });
  if (!privacy) {
    return NextResponse.json(
      { status: true, message: "No Privacy & Policy found.", data: [] },
      { status: 400 },
    );
  }

  return NextResponse.json({
    status: true,
    message: "Privacy & Policy retrieved successfully.",
    data: jsonSafe(privacy),
  });
}
