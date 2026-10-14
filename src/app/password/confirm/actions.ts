"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { ADMIN_HOME, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * `password.confirm` -> POST /password/confirm (`ConfirmsPasswords`).
 *
 * Implemented as a server action because the GET page owns the
 * `/password/confirm` route segment (Next forbids a sibling `route.ts`).
 * Verifies the current user's password and, on success, redirects to
 * `RouteServiceProvider::ADMIN_HOME` like the original.
 */
export async function confirmPassword(formData: FormData) {
  const user = await getCurrentUser();
  const password = String(formData.get("password") ?? "");

  const record = await prisma.users.findUnique({
    where: { id: user.id },
    select: { password: true },
  });
  const matches =
    record?.password != null
      ? await bcrypt.compare(password, record.password)
      : false;

  if (!matches) {
    redirect(
      `/password/confirm?error=${encodeURIComponent("The provided password is incorrect.")}`,
    );
  }

  redirect(ADMIN_HOME);
}
