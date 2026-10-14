import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { issueToken } from "@/lib/api-token";
import {
  firstRoleName,
  logoUrl,
  profilePictureUrl,
} from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/login
 *
 * Laravel `AuthController::login`, including the verification-code / device
 * flow. `email_or_phone` selects the lookup column via a FILTER_VALIDATE_EMAIL
 * style check.
 */
export async function POST(request: Request) {
  const body = await readRequestBody(request);

  const emailOrPhone = body.email_or_phone;
  if (emailOrPhone === undefined || emailOrPhone === null || emailOrPhone === "") {
    return NextResponse.json({
      status: false,
      message: "The email or phone field is required.",
    });
  }
  if (typeof emailOrPhone !== "string") {
    return NextResponse.json({
      status: false,
      message: "The email or phone field must be a string.",
    });
  }
  const password = body.password;
  if (password === undefined || password === null || password === "") {
    return NextResponse.json({
      status: false,
      message: "The password field is required.",
    });
  }
  if (typeof password !== "string") {
    return NextResponse.json({
      status: false,
      message: "The password field must be a string.",
    });
  }

  try {
    const lookupByEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
    const user = lookupByEmail
      ? await prisma.users.findUnique({ where: { email: emailOrPhone } })
      : await prisma.users.findFirst({ where: { phone: emailOrPhone } });

    const passwordMatches =
      user?.password != null && (await bcrypt.compare(password, user.password));
    if (!user || !passwordMatches) {
      return NextResponse.json({
        status: false,
        message: "Credentials mismatch",
      });
    }

    if (user.is_verified_device !== 1) {
      return NextResponse.json({
        status: false,
        message: "Device not verified. Please verify your device.",
      });
    }

    if (!user.is_admin) {
      if (user.device_id !== body.device_id) {
        return NextResponse.json({
          status: false,
          message: "Access denied. Please use your verified device.",
        });
      }
    }

    const role = await firstRoleName(user.id);
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
          role,
          status: user.is_enable ? "active" : "inactive",
          business_name: user.business_name,
          address: user.address,
          profile_picture_url: await profilePictureUrl(request, user),
          logo_url: await logoUrl(request, user),
        },
      },
    });
  } catch {
    return NextResponse.json({ status: false, message: "Something went wrong" });
  }
}
