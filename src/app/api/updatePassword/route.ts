import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/updatePassword
 *
 * Laravel `AuthController::updatePassword`. A `ValidationException` is caught
 * and collapsed to a generic `"Validation errors"` message.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);
  const currentPassword = body.current_password;
  const newPassword = body.new_password;
  const validationFailed =
    typeof currentPassword !== "string" ||
    currentPassword.length < 8 ||
    typeof newPassword !== "string" ||
    newPassword.length < 8 ||
    newPassword !== body.new_password_confirmation;
  if (validationFailed) {
    return NextResponse.json({
      status: false,
      message: "Validation errors",
    });
  }

  try {
    const matches =
      auth.user.password != null &&
      (await bcrypt.compare(currentPassword, auth.user.password));
    if (!matches) {
      return NextResponse.json({
        status: false,
        message: "Current password is incorrect.",
      });
    }

    await prisma.users.update({
      where: { id: auth.user.id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return NextResponse.json({
      status: true,
      message: "Password updated successfully.",
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Password update failed. Please try again later.",
    });
  }
}
