import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { jsonSafe, withAttachmentFullUrl } from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/support-ticket/close/{id}
 *
 * Laravel `CustomerController::support_ticket_close`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const ticket = await prisma.support_tickets.findUnique({
      where: { id: BigInt(id) },
    });

    if (ticket) {
      const updated = await prisma.support_tickets.update({
        where: { id: ticket.id },
        data: { status: "close", updated_at: new Date() },
      });

      return NextResponse.json({
        status: true,
        message: "Successfully close the ticket",
        data: withAttachmentFullUrl(jsonSafe(updated) as Record<string, unknown>),
      });
    }

    return NextResponse.json(
      { status: false, message: "Ticket not found" },
      { status: 403 },
    );
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Ticket Conversation Details.",
    });
  }
}
