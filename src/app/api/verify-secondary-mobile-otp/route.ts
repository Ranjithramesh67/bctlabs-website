import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * POST /api/verify-secondary-mobile-otp
 *
 * Laravel `AuthController::verifySecondaryMobileOtp`. Validation failures return
 * HTTP 200 `{status:false, message:"Validation errors", errors}`.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await readRequestBody(request);
    const phone = body.phone;
    const otp = body.otp;

    const errors: Record<string, string[]> = {};

    if (isBlank(phone)) {
      errors.phone = ["The phone field is required."];
    } else if (typeof phone !== "string") {
      errors.phone = ["The phone must be a string."];
    } else if (
      !(await prisma.users.findFirst({ where: { alternate_number: phone } }))
    ) {
      errors.phone = ["The selected phone is invalid."];
    }

    if (isBlank(otp)) {
      errors.otp = ["The otp field is required."];
    } else if (
      (typeof otp !== "string" && typeof otp !== "number") ||
      !/^\d{4}$/.test(String(otp))
    ) {
      errors.otp = ["The otp must be 4 digits."];
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({
        status: false,
        message: "Validation errors",
        errors,
      });
    }

    const user = await prisma.users.findFirst({
      where: { alternate_number: String(phone), id: auth.user.id },
    });
    if (!user) {
      return NextResponse.json({
        status: false,
        message: "Invalid Request",
      });
    }

    if (user.otp !== null && user.otp === otp) {
      await prisma.users.update({
        where: { id: user.id },
        data: { secondary_mobile_verified: 1, otp: null },
      });

      return NextResponse.json({
        status: true,
        message: "Secondary Mobile was verified successfully",
      });
    }

    return NextResponse.json({ status: false, message: "Invalid OTP." });
  } catch {
    return NextResponse.json({
      status: false,
      message: "OTP verification failed. Please try again later.",
    });
  }
}
