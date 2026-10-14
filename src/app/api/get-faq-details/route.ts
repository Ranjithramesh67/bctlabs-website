import { NextResponse } from "next/server";

import { jsonSafe } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/get-faq-details
 *
 * Laravel `AuthController::faq`. Empty results still answer with HTTP 400
 * (`status: true`).
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const faqs = await prisma.help_topics.findMany({
    orderBy: { ranking: "asc" },
  });
  if (faqs.length === 0) {
    return NextResponse.json(
      { status: true, message: "No Faq Data found.", data: [] },
      { status: 400 },
    );
  }

  return NextResponse.json({
    status: true,
    message: "Faq Data retrieved successfully.",
    data: jsonSafe(faqs),
  });
}
