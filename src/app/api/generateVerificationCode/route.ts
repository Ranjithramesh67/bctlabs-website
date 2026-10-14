import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Laravel `AuthController::generateAlphanumericCode()`. */
function generateAlphanumericCode(): string {
  let code = "";
  for (let i = 0; i < 9; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * POST /api/generateVerificationCode
 *
 * Laravel `AuthController::generateVerificationCode`. Note the validator runs
 * before the `is_admin` gate, so a malformed `mobile` reports a validation
 * error even for non-admins.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await readRequestBody(request);

    const mobile = body.mobile;
    let message: string | null = null;
    if (mobile === undefined || mobile === null || mobile === "") {
      message = "The mobile field is required.";
    } else if (typeof mobile !== "string") {
      message = "The mobile field must be a string.";
    } else if (!/^\d{10,15}$/.test(mobile)) {
      message = "The mobile field format is invalid.";
    }
    if (message !== null) {
      return NextResponse.json({ status: false, message });
    }

    if (!auth.user.is_admin) {
      return NextResponse.json({ status: false, message: "your not admin." });
    }

    const user = await prisma.users.findFirst({
      where: { phone: String(mobile) },
    });
    if (!user) {
      return NextResponse.json({
        status: false,
        message: "User not found for the provided mobile number.",
      });
    }

    const verificationCode = generateAlphanumericCode();
    await prisma.users.update({
      where: { id: user.id },
      data: {
        verification_code: verificationCode,
        is_verified_device: 0,
        device_id: null,
      },
    });

    return NextResponse.json({
      status: true,
      message: "Verification code generated successfully.",
      data: {
        user_id: user.id,
        name: user.first_name,
        mobile: user.phone,
        verification_code: verificationCode,
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "An error occurred while generating the verification code.",
    });
  }
}
