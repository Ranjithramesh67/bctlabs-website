import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import {
  attachmentFullUrl,
  jsonSafe,
  laravelDate,
  withAttachmentFullUrl,
} from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/support-ticket/conv/{ticket_id}
 *
 * Laravel `CustomerController::get_support_ticket_conv`. The ticket itself is
 * prepended to the conversation list as a synthetic first entry.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { ticket_id } = await params;

  try {
    const conversations = await prisma.support_ticket_convs.findMany({
      where: { support_ticket_id: BigInt(ticket_id) },
    });
    const supportTicket = await prisma.support_tickets.findUnique({
      where: { id: BigInt(ticket_id) },
    });

    const data = conversations.map((conversation) =>
      withAttachmentFullUrl(jsonSafe(conversation) as Record<string, unknown>),
    );

    if (supportTicket) {
      data.unshift({
        id: Number(ticket_id),
        support_ticket_id: ticket_id,
        admin_id: null,
        customer_message: supportTicket.description,
        msg_type: supportTicket.msg_type,
        admin_message: null,
        attachment_full_url: attachmentFullUrl(supportTicket.attachment),
        position: 0,
        created_at: supportTicket.created_at
          ? laravelDate(supportTicket.created_at)
          : null,
        updated_at: supportTicket.updated_at
          ? laravelDate(supportTicket.updated_at)
          : null,
      });
    }

    return NextResponse.json({
      status: true,
      message: "Ticket Conversation fetched successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Ticket Conversation Details.",
    });
  }
}
