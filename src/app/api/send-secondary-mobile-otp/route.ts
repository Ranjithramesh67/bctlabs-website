import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

const OTP = "0000";

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/** Port of `ValidationException::summarize()` (first message + "and N more"). */
function summarize(messages: string[]): string {
  if (messages.length === 0) {
    return "The given data was invalid.";
  }
  const [first, ...rest] = messages;
  if (rest.length === 0) {
    return first;
  }
  const pluralized = rest.length === 1 ? "error" : "errors";
  return `${first} (and ${rest.length} more ${pluralized})`;
}

/**
 * POST /api/send-secondary-mobile-otp
 *
 * Laravel `AuthController::secondaryMobilesendOtp`. The controller wraps
 * `$request->validate()` inside `try/catch(\Exception)`, so validation failures
 * surface as HTTP 500 `{status:false, message, error}` (the summarised
 * `ValidationException` message), not 422. The OTP is the hard-coded `"0000"`.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await readRequestBody(request);
    const phone = body.phone;

    const messages: string[] = [];
    if (isBlank(phone)) {
      messages.push("The phone field is required.");
    } else if (typeof phone !== "string") {
      messages.push("The phone must be a string.");
    }

    // The custom closure rule runs independently of required/string. A null
    // value compares against `phone is null OR alternate_number is null`,
    // mirroring Laravel's `where('phone', null)` → `whereNull`.
    let inUse = false;
    if (typeof phone === "string") {
      inUse = Boolean(
        await prisma.users.findFirst({
          where: { OR: [{ phone }, { alternate_number: phone }] },
        }),
      );
    } else if (phone === null || phone === undefined) {
      inUse = Boolean(
        await prisma.users.findFirst({
          where: { OR: [{ phone: null }, { alternate_number: null }] },
        }),
      );
    }
    if (inUse) {
      messages.push("The phone number is already in use.");
    }

    if (messages.length > 0) {
      return NextResponse.json(
        {
          status: false,
          message: "Something went wrong. Please try again later.",
          error: summarize(messages),
        },
        { status: 500 },
      );
    }

    await prisma.users.update({
      where: { id: auth.user.id },
      data: { alternate_number: String(phone), otp: OTP },
    });

    return NextResponse.json({
      status: true,
      message: "OTP sent successfully.",
      otp: OTP,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        message: "Something went wrong. Please try again later.",
        error: error instanceof Error ? error.message : "",
      },
      { status: 500 },
    );
  }
}
