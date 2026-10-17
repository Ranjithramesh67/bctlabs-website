import "server-only";

import { prisma } from "./prisma";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export type LoginGate = { allowed: true } | { allowed: false; retryAfter: number };

/** Reject sign-ins while an email is temporarily locked out. */
export async function checkLoginAllowed(email: string): Promise<LoginGate> {
  const row = await prisma.bctlabs_auth_attempts.findUnique({ where: { email } });
  if (!row?.locked_until) return { allowed: true };
  const remaining = Math.ceil((row.locked_until.getTime() - Date.now()) / 1000);
  if (remaining <= 0) return { allowed: true };
  return { allowed: false, retryAfter: remaining };
}

/** Count a failed sign-in and lock the email after too many attempts. */
export async function recordLoginFailure(email: string): Promise<void> {
  const row = await prisma.bctlabs_auth_attempts.upsert({
    where: { email },
    create: { email, attempts: 1 },
    update: { attempts: { increment: 1 } },
  });
  if (row.attempts >= MAX_ATTEMPTS) {
    await prisma.bctlabs_auth_attempts.update({
      where: { email },
      data: { attempts: 0, locked_until: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) },
    });
  }
}

export async function clearLoginFailures(email: string): Promise<void> {
  await prisma.bctlabs_auth_attempts.deleteMany({ where: { email } });
}
