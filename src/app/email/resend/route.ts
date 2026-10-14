import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export const instant = false;

/**
 * `verification.resend` -> POST /email/resend.
 *
 * The original sends the `VerifyEmail` notification. No mailer is configured
 * in this port, so this is a best-effort no-op: it confirms the user is signed
 * in and redirects back to the verification notice with the `resent` flash
 * equivalent (`?resent=1`). A real implementation would queue the notification
 * here.
 */
export async function POST(request: Request) {
  const { userId } = await getSession();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // No mailer is configured; sending the verification email is intentionally
  // skipped. The user still lands on the "fresh link sent" notice, mirroring
  // Laravel's `ResendsEmailVerification` redirect with `session('resent')`.
  return NextResponse.redirect(new URL("/email/verify?resent=1", request.url));
}
