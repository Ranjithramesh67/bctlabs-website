import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * PATCH /api/notifications/{id}/read
 *
 * Laravel `NotificationCreateController::readNotification`.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { status: false, message: "Invalid Request" },
      { status: 400 },
    );
  }

  const notification = await prisma.notifications.findFirst({
    where: { id: BigInt(id), user_id: auth.user.id },
  });
  if (!notification) {
    return NextResponse.json(
      { status: false, message: "Invalid Request" },
      { status: 400 },
    );
  }

  await prisma.notifications.update({
    where: { id: notification.id },
    data: { read_at: new Date() },
  });

  return NextResponse.json({
    status: true,
    message: "Notification marked as read successfully",
  });
}
