import { NextResponse } from "next/server";

import { readRequestBody } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { storeUserMedia } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

const PROFILE_COLLECTION = "profile";
const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 2048 * 1024;

const FAILURE = {
  status: false,
  message: "Failed to update profile picture. Please try again later.",
};

/**
 * POST /api/update_profile_picture
 *
 * Laravel `AuthController::updateProfilePicture`. The original validates the
 * upload but catches the resulting `ValidationException`, so *any* failure
 * (including a missing/invalid file) yields the same generic message.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await readRequestBody(request);
    const file = body.profile_picture;
    if (
      !(file instanceof File) ||
      !IMAGE_MIMES.has(file.type) ||
      file.size > MAX_IMAGE_BYTES
    ) {
      return NextResponse.json(FAILURE);
    }

    await prisma.users.update({
      where: { id: auth.user.id },
      data: { is_selfi_get: 1 },
    });

    const profilePictureUrl = await storeUserMedia(
      request,
      auth.user.id,
      PROFILE_COLLECTION,
      file,
    );

    return NextResponse.json({
      status: true,
      message: "Profile picture updated successfully.",
      profile_picture_url: profilePictureUrl,
    });
  } catch {
    return NextResponse.json(FAILURE);
  }
}
