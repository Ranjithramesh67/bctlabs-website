import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { profilePictureUrl } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/seller/chat/request/list
 *
 * Laravel `CustomerController::get_seller_chat_details`.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);

  // Rules are declared in this order: ticket_id, type.
  let message: string | null = null;
  if (body.ticket_id === undefined || body.ticket_id === null || body.ticket_id === "") {
    message = "The ticket id field is required.";
  } else if (body.type === undefined || body.type === null || body.type === "") {
    message = "The type field is required.";
  } else if (!["movie", "music", "concert", "sport"].includes(String(body.type))) {
    message = "The selected type is invalid.";
  }
  if (message !== null) {
    return NextResponse.json({ status: false, message });
  }

  try {
    const conversations = await prisma.ticket_booking.findMany({
      where: {
        ticket_id: Number(body.ticket_id),
        ticket_type: String(body.type),
        seller_id: auth.user.id,
      },
    });

    const messageData: Record<string, unknown>[] = [];
    for (const conversation of conversations) {
      const sender =
        conversation.user_id === null
          ? null
          : await prisma.users.findUnique({
              where: { id: conversation.user_id },
            });

      messageData.push({
        id: conversation.id,
        ticket_id: conversation.ticket_id,
        user_id: conversation.user_id,
        user_name: sender
          ? `${sender.first_name ?? ""} ${sender.last_name ?? ""}`
          : "Unknown",
        profile_picture_url: sender
          ? await profilePictureUrl(request, sender)
          : "Unknown",
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
      });
    }

    return NextResponse.json({
      status: true,
      message: "Ticket Chat Conversation fetched successfully.",
      data: messageData,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch Ticket Chat Conversation Details.",
    });
  }
}
