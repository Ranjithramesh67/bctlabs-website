import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { readUploadBody, storePublicFile } from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/support-ticket/reply/{ticket_id}
 *
 * Laravel `CustomerController::reply_support_ticket`. Note the status update
 * uses the query builder (no model events) and the new conversation row stores
 * `admin_id = 0`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { ticket_id } = await params;

  try {
    await prisma.support_tickets.updateMany({
      where: { id: BigInt(ticket_id) },
      data: { status: "open", updated_at: new Date() },
    });

    const { body, images } = await readUploadBody(request);

    const attachment: string[] = [];
    for (const image of images) {
      attachment.push(await storePublicFile(image, "support-ticket"));
    }

    const now = new Date();
    await prisma.support_ticket_convs.create({
      data: {
        support_ticket_id: BigInt(ticket_id),
        attachment: JSON.stringify(attachment),
        admin_id: BigInt(0),
        customer_message:
          typeof body.message === "string" ? body.message : null,
        msg_type: typeof body.msg_type === "string" ? body.msg_type : null,
        position: 0,
        created_at: now,
        updated_at: now,
      },
    });

    return NextResponse.json({
      status: true,
      message: "Support ticket reply sent.",
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to reply Support Ticket.",
    });
  }
}
