"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

// Laravel's bcrypt cost (existing hashes use `$2y$10$`).
const BCRYPT_ROUNDS = 10;
// config('auth.passwords.users.expire') is 60 minutes.
const TOKEN_TTL_SECONDS = 60 * 60;

type ResetRow = { token: string; created_at: Date | null };

/**
 * `password.update` -> POST /password/reset.
 *
 * `DatabaseTokenRepository` stores a bcrypt hash of the token and ignores
 * tokens older than `auth.passwords.users.expire`. Because `password_resets`
 * has no unique identifier, Prisma marks it `@@ignore`, so it is accessed via
 * raw SQL.
 */
export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(
    formData.get("password_confirmation") ?? "",
  );

  const fail = (message: string) =>
    redirect(
      `/password/reset/${encodeURIComponent(token)}?error=${encodeURIComponent(message)}`,
    );

  if (!email) {
    return fail("The email field is required.");
  }
  if (password.length < 8) {
    return fail("The password must be at least 8 characters.");
  }
  if (password !== passwordConfirmation) {
    return fail("The password and confirm password must match");
  }

  const rows = await prisma.$queryRaw<ResetRow[]>`
    SELECT token, created_at FROM password_resets
    WHERE email = ${email}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const row = rows[0];
  if (!row || !(await bcrypt.compare(token, row.token))) {
    return fail("This password reset token is invalid.");
  }
  if (
    row.created_at &&
    Date.now() - new Date(row.created_at).getTime() > TOKEN_TTL_SECONDS * 1000
  ) {
    return fail("This password reset token is invalid.");
  }

  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    return fail("We can't find a user with that email address.");
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(password, BCRYPT_ROUNDS) },
  });
  await prisma.$executeRaw`DELETE FROM password_resets WHERE email = ${email}`;

  redirect("/admin/dashboard");
}
