import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * PATCH /api/notifications/read-all
 *
 * Laravel `NotificationCreateController::readAllNotification`.
 */
export async function PATCH(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  await prisma.notifications.updateMany({
    where: { user_id: auth.user.id, read_at: null },
    data: { read_at: new Date() },
  });

  return NextResponse.json({
    status: true,
    message: "All notifications marked as read successfully",
  });
}
