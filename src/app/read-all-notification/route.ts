import { NextResponse } from "next/server";

import { loadCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * `NotificationController::readAllNotification`
 * (`POST /read-all-notification`).
 */
export async function POST() {
  const user = await loadCurrentUser();

  if (user) {
    await prisma.notifications.updateMany({
      where: { read_at: null, user_id: user.id },
      data: { read_at: new Date() },
    });
  }

  return NextResponse.json({
    success: true,
    message: t("notification.all_notification_read_successfully"),
  });
}
