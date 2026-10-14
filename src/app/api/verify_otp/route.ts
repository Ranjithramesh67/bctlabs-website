import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { issueToken } from "@/lib/api-token";
import { profilePictureUrl } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/verify_otp
 *
 * Laravel `AuthController::verifyOtp`. Validation failures return HTTP 200 with
 * a `{status, message, errors}` body (not the usual 422 envelope).
 */
export async function POST(request: Request) {
  const body = await readRequestBody(request);

  const errors: Record<string, string[]> = {};
  const phone = body.phone;
  if (phone === undefined || phone === null || phone === "") {
    errors.phone = ["The phone field is required."];
  } else if (typeof phone !== "string") {
    errors.phone = ["The phone field must be a string."];
  }

  const otp = body.otp;
  if (otp === undefined || otp === null || otp === "") {
    errors.otp = ["The otp field is required."];
  } else if (!/^\d{4}$/.test(String(otp))) {
    errors.otp = ["The otp must be 4 digits."];
  }

  if (!errors.phone && typeof phone === "string") {
    const exists = await prisma.users.findFirst({ where: { phone } });
    if (!exists) {
      errors.phone = ["The selected phone is invalid."];
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({
      status: false,
      message: "Validation errors",
      errors,
    });
  }

  try {
    const user = await prisma.users.findFirst({
      where: { phone: phone as string },
    });
    if (!user) {
      return NextResponse.json({ status: false, message: "Invalid OTP." });
    }

    if (user.otp === String(otp)) {
      const token = await issueToken(user.id, "auth_token");
      return NextResponse.json({
        status: true,
        message: "Login Success",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.first_name,
            is_location_verrify: user.is_location_verrify,
            is_selfi_get: user.is_selfi_get,
            is_profile_update: user.is_profile_update,
            status: user.is_enable ? "active" : "inactive",
            address: user.address,
            profile_picture_url: await profilePictureUrl(request, user),
          },
        },
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
