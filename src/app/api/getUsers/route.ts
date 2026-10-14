import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { serializeUser } from "@/lib/api-users";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/getUsers
 *
 * Laravel `AuthController::getUsers`. Only user id `1` may view the list; the
 * denial is a HTTP 200 body with `status:false`.
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    if (auth.user.id !== 1) {
      return NextResponse.json({
        status: false,
        message: "Permission denied. Only admins can view the user list.",
      });
    }

    const users = await prisma.users.findMany({ where: { NOT: { id: 1 } } });
    if (users.length === 0) {
      return NextResponse.json({
        status: false,
        message: "No users found.",
      });
    }

    return NextResponse.json({
      status: true,
      message: "Users list fetched successfully.",
      users: await Promise.all(users.map((user) => serializeUser(request, user))),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "An error occurred while fetching users.",
    });
  }
}
