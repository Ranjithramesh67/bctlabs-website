import { NextResponse } from "next/server";

import { jsonSafe } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { laravelFullName, profilePictureUrl } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/get-blocked-user
 *
 * Laravel `AuthController::blockedUser`. Returns every user with
 * `isBlocked = 1`, exposing the same subset of columns the original unset
 * (the rest are stripped via `unset()`).
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  const blocked = await prisma.users.findMany({ where: { isBlocked: 1 } });
  if (blocked.length === 0) {
    return NextResponse.json(
      {
        status: true,
        message: "No blocked user found.",
        data: [],
      },
      { status: 400 },
    );
  }

  const data = await Promise.all(
    blocked.map(async (user) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      gender: user.gender,
      alternate_number: user.alternate_number,
      state_name: user.state_name,
      city_name: user.city_name,
      state_id: user.state_id,
      city_id: user.city_id,
      email: user.email,
      phone: user.phone,
      isBlocked: user.isBlocked,
      blocked_reason: user.blocked_reason,
      secondary_mobile_verified: user.secondary_mobile_verified,
      full_name: laravelFullName(user.first_name, user.last_name),
      image_url: await profilePictureUrl(request, user),
    })),
  );

  return NextResponse.json({
    status: true,
    message: "Blocked User retrieved successfully.",
    data: jsonSafe(data),
  });
}
