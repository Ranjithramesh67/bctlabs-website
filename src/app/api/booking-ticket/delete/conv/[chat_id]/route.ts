import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/booking-ticket/delete/conv/{chat_id}
 *
 * Laravel `CustomerController::deleteChatData` (soft delete).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ chat_id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { chat_id } = await params;

  try {
    const conversation = await prisma.ticket_booking_convs.findFirst({
      where: {
        id: BigInt(chat_id),
        user_id: BigInt(auth.user.id),
      },
    });

    if (conversation) {
      await prisma.ticket_booking_convs.update({
        where: { id: conversation.id },
        data: {
          isDeleted: 1,
          deleted_by: auth.user.id,
          deleted_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      status: true,
      message: "Ticket Booking Conversation deleted successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        status: false,
        message: "Failed to Delete Ticket Booking Conversation Details.",
      },
      { status: 400 },
    );
  }
}
