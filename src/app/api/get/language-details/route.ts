import { NextResponse } from "next/server";

import { serializeCommerce } from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/get/language-details
 *
 * Laravel `CategoryController::getLanguageDetails`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const languages = await prisma.languages.findMany({
      where: { is_app_language: 1 },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      status: true,
      message: "Language Data fetched successfully.",
      data: serializeCommerce(languages),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Language Details.",
    });
  }
}
