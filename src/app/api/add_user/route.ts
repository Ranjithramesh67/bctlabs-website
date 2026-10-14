import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { readAdminBody, validateUserPayload } from "@/lib/api-admin";
import { laravelUrl } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { attachRoleByName, storeUserMedia } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/add_user
 *
 * Laravel `AuthController::addUser`. The permission gate runs before the
 * validator; a non-empty `type` always assigns the `business` role.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    if (auth.user.id !== 1) {
      return NextResponse.json({
        status: false,
        message: "Permission denied. Only admins can add users.",
      });
    }

    const body = await readAdminBody(request);

    const validation = await validateUserPayload(body, { partial: false });
    if (validation !== null) {
      return NextResponse.json({ status: false, message: validation });
    }

    const now = new Date();
    const user = await prisma.users.create({
      data: {
        first_name: String(body.name),
        email: String(body.email),
        phone: String(body.mobile),
        business_name:
          body.business_name === undefined || body.business_name === null
            ? null
            : String(body.business_name),
        address:
          body.address === undefined || body.address === null
            ? null
            : String(body.address),
        password: await bcrypt.hash(String(body.password), 10),
        is_enable: true,
        created_at: now,
        updated_at: now,
      },
    });

    // Role::where('name', 'business')->firstOrFail()
    const roleExists = await prisma.roles.findFirst({
      where: { name: "business" },
    });
    if (!roleExists) {
      throw new Error("Role business not found");
    }
    await attachRoleByName(user.id, "business");

    let profilePictureUrl: string | null = null;
    if (body.profile_picture instanceof File) {
      profilePictureUrl = await storeUserMedia(
        request,
        user.id,
        "profile",
        body.profile_picture,
      );
    }

    let logoUrl: string | null = null;
    if (body.logo instanceof File) {
      logoUrl = await storeUserMedia(request, user.id, "logos", body.logo);
    }

    return NextResponse.json({
      status: true,
      message: "User added successfully.",
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.first_name,
        business_name: user.business_name,
        address: user.address,
        status: user.is_enable ? "active" : "inactive",
        profile_picture_url: laravelUrl(request, profilePictureUrl),
        logo_url: laravelUrl(request, logoUrl),
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to add user. Please try again later.",
    });
  }
}
