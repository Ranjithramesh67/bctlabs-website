import { NextResponse } from "next/server";

import { requireApiUser, USER_MODEL_TYPE } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/logout
 *
 * Laravel `AuthController::logout`: revoke every token belonging to the user.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  await prisma.personal_access_tokens.deleteMany({
    where: {
      tokenable_type: USER_MODEL_TYPE,
      tokenable_id: BigInt(auth.user.id),
    },
  });

  return NextResponse.json({
    status: true,
    message: "Logged out successfully.",
  });
}
