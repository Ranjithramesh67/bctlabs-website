import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const instant = false;

/**
 * `verification.verify` -> GET /email/verify/{id}/{hash}.
 *
 * Laravel's `VerifiesEmails` compares `sha1($user->getEmailForVerification())`
 * with the route `hash` (the surrounding query signature comes from the
 * `signed` middleware). We keep the `sha1(email)` check and require the
 * signed-in user to match `id`, then mark `email_verified_at`, mirroring
 * `markEmailAsVerified()` and the `RouteServiceProvider::ADMIN_HOME` redirect.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; hash: string }> },
) {
  const { userId } = await getSession();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { id, hash } = await params;
  const numericId = /^\d+$/.test(id) ? Number(id) : null;
  if (numericId === null || numericId !== userId) {
    return NextResponse.redirect(new URL("/email/verify", request.url));
  }

  const user = await prisma.users.findUnique({
    where: { id: numericId },
    select: { id: true, email: true, email_verified_at: true },
  });

  const expected =
    user?.email == null
      ? null
      : createHash("sha1").update(user.email).digest("hex");

  if (!user || expected === null || hash !== expected) {
    return NextResponse.redirect(new URL("/email/verify", request.url));
  }

  if (user.email_verified_at === null) {
    await prisma.users.update({
      where: { id: user.id },
      data: { email_verified_at: new Date() },
    });
  }

  return NextResponse.redirect(new URL("/admin/dashboard", request.url));
}
