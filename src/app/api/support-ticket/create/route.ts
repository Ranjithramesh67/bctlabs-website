import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { isBlank, readUploadBody, storePublicFile } from "@/lib/api-tickets";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/support-ticket/create
 *
 * Laravel `CustomerController::create_support_ticket`. Validation failures
 * return HTTP 400 (not the usual 200) with the first error message.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { body, images } = await readUploadBody(request);

  // Rules are declared in this order: subject, type, description.
  let message: string | null = null;
  if (isBlank(body.subject)) {
    message = "The subject field is required.";
  } else if (isBlank(body.type)) {
    message = "The type field is required.";
  } else if (isBlank(body.description)) {
    message = "The description field is required.";
  }
  if (message !== null) {
    return NextResponse.json({ status: false, message }, { status: 400 });
  }

  try {
    const attachment: string[] = [];
    for (const image of images) {
      attachment.push(await storePublicFile(image, "support-ticket"));
    }

    const now = new Date();
    await prisma.support_tickets.create({
      data: {
        customer_id: BigInt(auth.user.id),
        subject: String(body.subject),
        type: typeof body.type === "string" ? body.type : "",
        msg_type: typeof body.msg_type === "string" ? body.msg_type : "",
        priority: typeof body.priority === "string" ? body.priority : "",
        description: String(body.description),
        attachment: JSON.stringify(attachment),
        status: "pending",
        created_at: now,
        updated_at: now,
      },
    });

    return NextResponse.json({
      status: true,
      message: "Support ticket created successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        status: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 400 },
    );
  }
}
