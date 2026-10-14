import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { jsonSafe, withAttachmentFullUrl } from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/support-ticket/get
 *
 * Laravel `CustomerController::get_support_tickets`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const tickets = await prisma.support_tickets.findMany({
      where: { customer_id: BigInt(auth.user.id) },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      status: true,
      message: "Support Ticket fetched successfully.",
      data: tickets.map((ticket) =>
        withAttachmentFullUrl(jsonSafe(ticket) as Record<string, unknown>),
      ),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Support Ticket Details.",
    });
  }
}
