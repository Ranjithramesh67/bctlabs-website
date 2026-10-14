import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { prisma } from "@/lib/prisma";

export const instant = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/ForgetPassword
 *
 * Laravel `AuthController::ForgetPassword`. The reset token is generated and
 * persisted to `password_resets` exactly as `Password::createToken` does, but
 * the email/SMS delivery is skipped (no provider is configured).
 */
export async function POST(request: Request) {
  const body = await readRequestBody(request);

  const hasEmail = "email" in body && body.email !== null;
  const hasPhone = "phone" in body && body.phone !== null;

  const validationFailed =
    (!hasEmail && !hasPhone) ||
    (hasEmail && !EMAIL_PATTERN.test(String(body.email))) ||
    (hasPhone && typeof body.phone !== "string");
  if (validationFailed) {
    return NextResponse.json({
      status: false,
      message: "Validation errors",
    });
  }

  try {
    const user = hasEmail
      ? await prisma.users.findUnique({ where: { email: String(body.email) } })
      : await prisma.users.findFirst({ where: { phone: String(body.phone) } });

    if (!user) {
      return NextResponse.json({
        status: false,
        message: "User not found.",
      });
    }

    // `Password::createToken($user)`: clear existing rows, then store a bcrypt
    // hash of a fresh 64-char token against the user's email.
    const resetEmail = user.email;
    const plainToken = randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(plainToken, 10);
    await prisma.$executeRaw`DELETE FROM password_resets WHERE email = ${resetEmail}`;
    await prisma.$executeRaw`INSERT INTO password_resets (email, token, created_at) VALUES (${resetEmail}, ${tokenHash}, ${new Date()})`;

    return NextResponse.json({
      status: true,
      message: "Password reset token sent successfully.",
    });
  } catch {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
