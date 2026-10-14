import { NextResponse } from "next/server";

import { isNumeric, readRequestBody } from "@/lib/api-format";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/sendOtp
 *
 * Laravel `AuthController::sendOtp`. The SMS provider is intentionally not
 * invoked (none is configured); the OTP is still generated and stored exactly
 * as the original does.
 */
export async function POST(request: Request) {
  const body = await readRequestBody(request);
  const phone = body.phone;

  if (phone === undefined || phone === null || phone === "") {
    return NextResponse.json(
      { status: false, message: "The phone field is required." },
      { status: 422 },
    );
  }
  if (!isNumeric(phone)) {
    return NextResponse.json(
      { status: false, message: "The phone field must be a number." },
      { status: 422 },
    );
  }

  const phoneValue = String(phone);
  const otp = "0000";

  const user = await prisma.users.findFirst({ where: { phone: phoneValue } });
  if (user) {
    await prisma.users.update({ where: { id: user.id }, data: { otp } });
  } else {
    await prisma.users.create({ data: { phone: phoneValue, otp } });
  }

  return NextResponse.json({
    status: true,
    message: "OTP sent successfully.",
    otp,
  });
}
