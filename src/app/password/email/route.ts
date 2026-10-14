import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const instant = false;

// Laravel's bcrypt cost (existing hashes use `$2y$10$`).
const BCRYPT_ROUNDS = 10;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function backWithError(request: Request, message: string): NextResponse {
  const target = new URL("/password/reset", request.url);
  target.searchParams.set("errors", message);
  return NextResponse.redirect(target);
}

/**
 * `password.email` -> POST /password/email (`SendsPasswordResetEmails`).
 *
 * Creates a bcrypt-hashed token in the `password_resets` table exactly like
 * `DatabaseTokenRepository::create`. No mailer is configured in this port, so
 * the reset link cannot actually be delivered — in development the generated
 * link is logged to the server console so the flow can still be exercised.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const raw = form?.get("email");
  const email = typeof raw === "string" ? raw.trim() : "";

  if (!email) {
    return backWithError(request, "The email field is required.");
  }
  if (!EMAIL_PATTERN.test(email)) {
    return backWithError(request, "Please enter valid email.");
  }

  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    return backWithError(request, "We can't find a user with that email address.");
  }

  const token = randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(token, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.$executeRaw`DELETE FROM password_resets WHERE email = ${email}`,
    prisma.$executeRaw`
      INSERT INTO password_resets (email, token, created_at)
      VALUES (${email}, ${hashedToken}, NOW())
    `,
  ]);

  if (process.env.NODE_ENV !== "production") {
    // No mailer is configured: surface the link locally so the reset flow can
    // be completed during development/verification.
    console.info(`[password-reset] ${email} -> /password/reset/${token}`);
  }

  // Laravel redirects back with `session('status')`; the customized
  // `passwords/email.blade.php` in this app does not render it, so neither do
  // we. The redirect target stays the same request form.
  return NextResponse.redirect(new URL("/password/reset", request.url));
}
