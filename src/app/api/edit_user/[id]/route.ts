import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { readAdminBody, validateUserPayload } from "@/lib/api-admin";
import { requireApiUser, USER_MODEL_TYPE } from "@/lib/api-token";
import { serializeUser, storeUserMedia } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/edit_user/{id}
 *
 * Laravel `AuthController::editUser`. Only user id `1` may edit; every field is
 * optional and `type` always (re)assigns the `business` role.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;

  try {
    if (auth.user.id !== 1) {
      return NextResponse.json({
        status: false,
        message: "Permission denied. Only admins can edit users.",
      });
    }

    const userId = Number(id);
    const existing = await prisma.users.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json({
        status: false,
        message: "User not found.",
      });
    }

    const body = await readAdminBody(request);

    const validation = await validateUserPayload(body, {
      partial: true,
      userId,
    });
    if (validation !== null) {
      return NextResponse.json({ status: false, message: validation });
    }

    const has = (key: string): boolean => {
      const value = body[key];
      return value !== undefined && value !== null && value !== "";
    };

    const data: Record<string, unknown> = { updated_at: new Date() };
    if (has("name")) data.first_name = String(body.name);
    if (has("email")) data.email = String(body.email);
    if (has("mobile")) data.phone = String(body.mobile);
    if (has("business_name")) data.business_name = String(body.business_name);
    if (has("address")) data.address = String(body.address);
    if (has("password")) {
      data.password = await bcrypt.hash(String(body.password), 10);
    }

    if (has("type")) {
      // $user->roles()->sync([$role->id]) with role 'business'.
      const role = await prisma.roles.findFirst({ where: { name: "business" } });
      if (!role) {
        throw new Error("Role business not found");
      }
      await prisma.model_has_roles.deleteMany({
        where: { model_id: BigInt(userId), model_type: USER_MODEL_TYPE },
      });
      await prisma.model_has_roles.create({
        data: {
          role_id: role.id,
          model_id: BigInt(userId),
          model_type: USER_MODEL_TYPE,
        },
      });
    }

    if (body.profile_picture instanceof File) {
      await storeUserMedia(request, userId, "profile", body.profile_picture);
    }
    if (body.logo instanceof File) {
      await storeUserMedia(request, userId, "logos", body.logo);
    }

    const user = await prisma.users.update({ where: { id: userId }, data });

    return NextResponse.json({
      status: true,
      message: "User updated successfully.",
      data: await serializeUser(request, user),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to update user. Please try again later.",
    });
  }
}
