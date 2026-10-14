import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { readUploadBody, storePublicFile } from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/booking-ticket/reply/{booking_id}
 *
 * Laravel `CustomerController::reply_ticket_booking`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ booking_id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { booking_id } = await params;

  try {
    const { body, images } = await readUploadBody(request);

    const attachment: string[] = [];
    for (const image of images) {
      attachment.push(await storePublicFile(image, "support-ticket"));
    }

    const now = new Date();
    await prisma.ticket_booking_convs.create({
      data: {
        ticket_booking_id: BigInt(booking_id),
        attachment: JSON.stringify(attachment),
        user_id: BigInt(auth.user.id),
        customer_message:
          typeof body.message === "string" ? body.message : null,
        msg_type: typeof body.msg_type === "string" ? body.msg_type : null,
        created_at: now,
        updated_at: now,
      },
    });

    return NextResponse.json({
      status: true,
      message: "Ticket Booking reply sent.",
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to reply Booking Ticket.",
    });
  }
}
