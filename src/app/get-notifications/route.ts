import { NextResponse } from "next/server";

import { jsonSafe } from "@/lib/api-format";
import { loadCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * `NotificationController::index` (`GET /get-notifications`).
 *
 * The original route is registered outside the `auth` middleware, so an
 * unauthenticated visitor (`Auth::id() === null`) still receives a 200
 * `sendResponse` envelope. We mirror that behaviour: guests get the same
 * envelope with an empty `data` array.
 */
export async function GET() {
  const user = await loadCurrentUser();

  const notifications = user
    ? await prisma.notifications.findMany({
        where: { user_id: user.id, read_at: null },
        orderBy: { created_at: "desc" },
      })
    : [];

  return NextResponse.json({
    success: true,
    data: jsonSafe(notifications),
    message: "Notification retrieved successfully",
  });
}
