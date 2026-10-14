import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { laravelUrl, readRequestBody } from "@/lib/api-format";
import { issueToken } from "@/lib/api-token";
import { attachRoleByName, storeUserMedia } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

const PROFILE_COLLECTION = "profile";
const LOGO_COLLECTION = "logos";
const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 2048 * 1024;

/** Laravel's `image|mimes:jpeg,png,jpg,gif|max:2048` error message. */
function invalidImageMessage(field: string, file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return `The ${field} field must be an image.`;
  }
  if (!IMAGE_MIMES.has(file.type)) {
    return `The ${field} field must be a file of type: jpeg, png, jpg, gif.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `The ${field} field must not be greater than 2048 kilobytes.`;
  }
  return null;
}

/**
 * POST /api/register
 *
 * Laravel `AuthController::register`. Accepts JSON or multipart/form-data (the
 * latter for the optional `profile_picture` / `logo` uploads).
 */
export async function POST(request: Request) {
  try {
    const body = await readRequestBody(request);

    const name = body.name;
    if (name === undefined || name === null || name === "") {
      return NextResponse.json({
        status: false,
        message: "The name field is required.",
      });
    }

    const email = body.email;
    if (email === undefined || email === null || email === "") {
      return NextResponse.json({
        status: false,
        message: "The email field is required.",
      });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        status: false,
        message: "The email field must be a valid email address.",
      });
    }
    if (await prisma.users.findUnique({ where: { email } })) {
      return NextResponse.json({
        status: false,
        message: "The email has already been taken.",
      });
    }

    const mobile = body.mobile;
    if (mobile === undefined || mobile === null || mobile === "") {
      return NextResponse.json({
        status: false,
        message: "The mobile field is required.",
      });
    }
    if (!/^[0-9]{8,15}$/.test(String(mobile))) {
      return NextResponse.json({
        status: false,
        message: "The mobile format is invalid.",
      });
    }
    const mobileValue = String(mobile);
    if (await prisma.users.findFirst({ where: { phone: mobileValue } })) {
      return NextResponse.json({
        status: false,
        message: "The mobile has already been taken.",
      });
    }

    const password = body.password;
    if (password === undefined || password === null || password === "") {
      return NextResponse.json({
        status: false,
        message: "The password field is required.",
      });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({
        status: false,
        message: "The password field must be at least 8 characters.",
      });
    }
    if (password !== body.password_confirmation) {
      return NextResponse.json({
        status: false,
        message: "The password confirmation does not match.",
      });
    }

    const deviceId = body.device_id;
    if (deviceId === undefined || deviceId === null || deviceId === "") {
      return NextResponse.json({
        status: false,
        message: "The device id field is required.",
      });
    }

    const type = body.type;
    if (type === undefined || type === null || type === "") {
      return NextResponse.json({
        status: false,
        message: "The type field is required.",
      });
    }
    if (type !== "personal" && type !== "business") {
      return NextResponse.json({
        status: false,
        message: "The selected type is invalid.",
      });
    }

    const profilePicture =
      body.profile_picture instanceof File ? body.profile_picture : null;
    const logo = body.logo instanceof File ? body.logo : null;
    const profilePictureError = profilePicture
      ? invalidImageMessage("profile picture", profilePicture)
      : null;
    if (profilePictureError) {
      return NextResponse.json({
        status: false,
        message: profilePictureError,
      });
    }
    const logoError = logo ? invalidImageMessage("logo", logo) : null;
    if (logoError) {
      return NextResponse.json({ status: false, message: logoError });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        first_name: String(name),
        email,
        phone: mobileValue,
        business_name:
          body.business_name != null ? String(body.business_name) : null,
        address: body.address != null ? String(body.address) : null,
        device_id: String(deviceId),
        password: passwordHash,
        otp: String(Math.floor(1000 + Math.random() * 9000)),
      },
    });

    await attachRoleByName(user.id, type === "personal" ? "client" : "business");
    const token = await issueToken(user.id, "auth_token");

    const profilePictureUrl = profilePicture
      ? await storeUserMedia(request, user.id, PROFILE_COLLECTION, profilePicture)
      : null;
    const logoMediaUrl = logo
      ? await storeUserMedia(request, user.id, LOGO_COLLECTION, logo)
      : null;

    return NextResponse.json({
      status: true,
      message: "Registration successful.",
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.first_name,
        business_name: user.business_name,
        address: user.address,
        status: user.is_enable ? "active" : "inactive",
        profile_picture_url: laravelUrl(request, profilePictureUrl),
        logo_url: laravelUrl(request, logoMediaUrl),
        token,
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Registration failed. Please try again later.",
    });
  }
}
