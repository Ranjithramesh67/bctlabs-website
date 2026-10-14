import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { attachmentFullUrl, jsonSafe } from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/booking-ticket/conv/{booking_id}
 *
 * Laravel `CustomerController::get_booking_ticket_conv`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ booking_id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { booking_id } = await params;

  try {
    const bookingTicket = await prisma.ticket_booking.findUnique({
      where: { id: Number(booking_id) },
    });

    const conversations = await prisma.ticket_booking_convs.findMany({
      where: {
        ticket_booking_id: BigInt(booking_id),
        isDeleted: 0,
      },
    });

    const messageData: Record<string, unknown>[] = [];
    for (const conversation of conversations) {
      const conv = jsonSafe(conversation) as Record<string, unknown>;
      const sender =
        conversation.user_id === null
          ? null
          : await prisma.users.findUnique({
              where: { id: Number(conversation.user_id) },
            });

      messageData.push({
        id: conv.id,
        message: conv.customer_message,
        user_id: conv.user_id,
        user_name: sender
          ? `${sender.first_name ?? ""} ${sender.last_name ?? ""}`
          : "Unknown",
        position:
          conversation.user_id !== null &&
          Number(conversation.user_id) === auth.user.id
            ? 1
            : 0,
        msg_type: conv.msg_type,
        attachment_full_url: attachmentFullUrl(conversation.attachment),
        created_at: conv.created_at ?? null,
        updated_at: conv.updated_at ?? null,
      });
    }

    return NextResponse.json({
      status: true,
      message: "Ticket Booking Conversation fetched successfully.",
      data: messageData,
      booking_ticket: jsonSafe(bookingTicket),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Ticket Booking Conversation Details.",
    });
  }
}
