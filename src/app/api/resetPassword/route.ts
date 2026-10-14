import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { prisma } from "@/lib/prisma";

export const instant = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 60 * 60 * 1000; // auth.passwords.users.expire = 60 minutes

/**
 * POST /api/resetPassword
 *
 * Laravel `AuthController::resetPassword` backed by `Password::reset`. Quirk:
 * the controller only maps `INVALID_TOKEN`, so an unknown user falls through
 * to the success response (reproduced below).
 */
export async function POST(request: Request) {
  const body = await readRequestBody(request);

  const hasEmail = "email" in body && body.email !== null;
  const hasPhone = "phone" in body && body.phone !== null;
  const password = body.password;

  const validationFailed =
    body.token === undefined ||
    body.token === null ||
    typeof body.token !== "string" ||
    (!hasEmail && !hasPhone) ||
    (hasEmail && !EMAIL_PATTERN.test(String(body.email))) ||
    (hasPhone && typeof body.phone !== "string") ||
    typeof password !== "string" ||
    password.length < 8 ||
    password !== body.password_confirmation;
  if (validationFailed) {
    return NextResponse.json({
      status: false,
      message: "Validation errors",
    });
  }

  try {
    let user = null;
    if (hasEmail && hasPhone) {
      user = await prisma.users.findFirst({
        where: { email: String(body.email), phone: String(body.phone) },
      });
    } else if (hasEmail) {
      user = await prisma.users.findUnique({
        where: { email: String(body.email) },
      });
    } else {
      user = await prisma.users.findFirst({
        where: { phone: String(body.phone) },
      });
    }

    // `Password::reset` returns INVALID_USER when the account is missing, which
    // this controller does not distinguish from success.
    if (!user) {
      return NextResponse.json({
        status: true,
        message: "Password reset successfully.",
      });
    }

    const rows = await prisma.$queryRaw<
      Array<{ token: string; created_at: Date | null }>
    >`SELECT token, created_at FROM password_resets WHERE email = ${user.email} ORDER BY created_at DESC LIMIT 1`;
    const record = rows[0];

    const tokenValid =
      record != null &&
      record.created_at != null &&
      Date.now() - record.created_at.getTime() <= TOKEN_TTL_MS &&
      (await bcrypt.compare(String(body.token), record.token));
    if (!tokenValid) {
      return NextResponse.json({
        status: false,
        message: "Invalid token.",
      });
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 10) },
    });
    await prisma.$executeRaw`DELETE FROM password_resets WHERE email = ${user.email}`;

    return NextResponse.json({
      status: true,
      message: "Password reset successfully.",
    });
  } catch {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
