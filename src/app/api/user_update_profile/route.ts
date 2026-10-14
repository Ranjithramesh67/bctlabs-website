import { NextResponse } from "next/server";

import { isNumeric, readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { serializeUser } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDERS = ["male", "female", "other"];

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * POST /api/user_update_profile
 *
 * Laravel `AuthController::user_update_status`. Validation failures return the
 * first message with HTTP 200 (`{status:false, message}`), matching
 * `$validator->errors()->first()`.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await readRequestBody(request);

  // Rules are evaluated per attribute in the order declared by the controller:
  // full_name, email, gender, alternate_number.
  let message: string | null = null;

  const fullName = body.full_name;
  if (isBlank(fullName)) {
    message = "The full name field is required.";
  } else if (typeof fullName !== "string") {
    message = "The full name must be a string.";
  } else if (fullName.length > 255) {
    message = "The full name must not be greater than 255 characters.";
  }

  const email = body.email;
  if (message === null) {
    if (isBlank(email)) {
      message = "The email field is required.";
    } else if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
      message = "The email must be a valid email address.";
    } else if (
      await prisma.users.findFirst({
        where: { email, NOT: { id: auth.user.id } },
      })
    ) {
      message = "The email has already been taken.";
    }
  }

  const gender = body.gender;
  if (message === null) {
    if (isBlank(gender)) {
      message = "The gender field is required.";
    } else if (typeof gender !== "string") {
      message = "The gender must be a string.";
    } else if (!GENDERS.includes(gender)) {
      message = "The selected gender is invalid.";
    }
  }

  const alternateNumber = body.alternate_number;
  if (
    message === null &&
    !isBlank(alternateNumber) &&
    !isNumeric(alternateNumber)
  ) {
    message = "The alternate number must be a number.";
  }

  if (message !== null) {
    return NextResponse.json({ status: false, message });
  }

  try {
    const user = await prisma.users.update({
      where: { id: auth.user.id },
      data: {
        first_name: String(fullName),
        email: String(email),
        gender: String(gender),
        alternate_number: isBlank(alternateNumber)
          ? null
          : String(alternateNumber),
        is_profile_update: 1,
      },
    });

    return NextResponse.json({
      status: true,
      message: "User status updated successfully.",
      user: await serializeUser(request, user),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "An error occurred while updating user status.",
    });
  }
}
