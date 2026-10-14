import { NextResponse } from "next/server";

import { loadCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * `NotificationController::readNotification`
 * (`POST /notification/{notification}/read`).
 *
 * The update is scoped to the current user so a foreign notification id is
 * never modified. The original always answers with `sendSuccess`, so the
 * success envelope is returned regardless of whether a row matched.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ notification: string }> },
) {
  const user = await loadCurrentUser();
  const { notification } = await params;
  const id = Number(notification);

  if (user && Number.isInteger(id) && id > 0) {
    await prisma.notifications.updateMany({
      where: { id: BigInt(id), user_id: user.id },
      data: { read_at: new Date() },
    });
  }

  return NextResponse.json({
    success: true,
    message: t("notification.notification_read_successfully"),
  });
}
