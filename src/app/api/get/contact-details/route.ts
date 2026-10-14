import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/get/contact-details
 *
 * Laravel `CategoryController::getcontactDetails` (`pluck('value', 'key')`).
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const settings = await prisma.settings.findMany({ orderBy: { id: "asc" } });
    const data: Record<string, unknown> = {};
    for (const setting of settings) {
      data[setting.key] = setting.value;
    }

    return NextResponse.json({
      status: true,
      message: "Setting Data fetched successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Contact Details.",
    });
  }
}
