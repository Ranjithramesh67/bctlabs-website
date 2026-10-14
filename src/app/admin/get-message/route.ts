import { NextResponse } from "next/server";

import { laravelUrl } from "@/lib/api-format";
import { loadCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

// Laravel hard-codes the admin avatar in the response payload.
const SENDER_IMAGE_URL =
  "https://reservedtickets.in/uploads/53/bs4Xwx4pzPhqYdPHAjzK3GM94W0fWPhlZwkUAVKs.png";

/** Carbon `->format('d M Y h:i A')`. */
function formatDateTime(date: Date | null): string {
  if (!date) {
    return "";
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  let hours = date.getUTCHours();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  if (hours === 0) {
    hours = 12;
  }
  const hh = String(hours).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} ${hh}:${mm} ${meridiem}`;
}

/** Eloquent's `attachment` array cast -> a single path. */
function attachmentPath(raw: string | null): string | null {
  if (!raw) {
    return null;
  }
  let value: unknown = raw;
  try {
    value = JSON.parse(raw);
  } catch {
    value = raw;
  }
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : null;
  }
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Laravel `ChatController::getMessages`.
 *
 * Note the original uses the `user_id` query parameter as the support ticket
 * id (`SupportTicketConv::where('support_ticket_id', $request->user_id)`).
 */
export async function GET(request: Request) {
  const user = await loadCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const userId = new URL(request.url).searchParams.get("user_id");

  let ticketId: bigint | null = null;
  if (userId !== null && /^\d+$/.test(userId)) {
    ticketId = BigInt(userId);
  } else if (userId === null) {
    ticketId = null;
  } else {
    // Non-numeric value -> no matching rows (Laravel where clause).
    return NextResponse.json({ status: true, messages: [] });
  }

  const messages = await prisma.support_ticket_convs.findMany({
    where: { support_ticket_id: ticketId },
    orderBy: { created_at: "asc" },
  });

  const firstTicketId = messages[0]?.support_ticket_id ?? null;
  let customerImage: string | null = null;
  if (firstTicketId !== null) {
    const ticket = await prisma.support_tickets.findUnique({
      where: { id: firstTicketId },
    });
    if (ticket?.customer_id !== null && ticket?.customer_id !== undefined) {
      const customer = await prisma.users.findUnique({
        where: { id: Number(ticket.customer_id) },
      });
      customerImage = customer?.image ?? null;
    }
  }
  const userImage = customerImage
    ? laravelUrl(request, customerImage)
    : laravelUrl(request, "support-ticket/icons8-user-default-64.png");

  const response = messages.map((message) => {
    const path = attachmentPath(message.attachment);
    return {
      side: message.admin_id ? "right" : "left",
      message: message.admin_id
        ? message.admin_message
        : message.customer_message,
      type: message.msg_type,
      file_url: path ? laravelUrl(request, path) : null,
      created_at: formatDateTime(message.created_at),
      sender_image_url: SENDER_IMAGE_URL,
      user_image: userImage,
    };
  });

  return NextResponse.json({ status: true, messages: response });
}
