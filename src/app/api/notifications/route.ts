import { NextResponse } from "next/server";

import { jsonSafe } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/notifications
 *
 * Laravel `NotificationCreateController::index`: unread notifications for the
 * authenticated user, newest first.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const notifications = await prisma.notifications.findMany({
    where: { user_id: auth.user.id, read_at: null },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({
    status: true,
    message: "Notifications retrieved successfully",
    data: jsonSafe(notifications),
  });
}
