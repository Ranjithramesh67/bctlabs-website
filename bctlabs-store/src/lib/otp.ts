import "server-only";

import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

import { prisma } from "./prisma";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export type OtpPurpose = "signup" | "password-reset";

export type SignupPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  passwordHash: string;
};

function normalise(email: string): string {
  return email.trim().toLowerCase();
}

function codeHash(code: string): Promise<string> {
  return bcrypt.hash(code, 8);
}

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

/** Codes are only echoed back to the client in local/dev without a mail relay. */
export function canExposeDevCode(): boolean {
  return process.env.NODE_ENV !== "production" && !isEmailDeliveryConfigured();
}

export async function createEmailOtp(input: {
  email: string;
  purpose: OtpPurpose;
  payload?: unknown;
}): Promise<{ code: string; expiresAt: Date }> {
  const email = normalise(input.email);
  const now = new Date();

  await prisma.bctlabs_email_verifications.updateMany({
    where: { email, purpose: input.purpose, consumed_at: null },
    data: { consumed_at: now },
  });

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const expiresAt = new Date(now.getTime() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.bctlabs_email_verifications.create({
    data: {
      email,
      purpose: input.purpose,
      code_hash: await codeHash(code),
      payload: (input.payload ?? null) as never,
      expires_at: expiresAt,
    },
  });

  return { code, expiresAt };
}

export type VerifyOtpResult =
  | { ok: true; payload: unknown }
  | { ok: false; reason: "missing" | "expired" | "invalid" | "too_many" };

export async function verifyEmailOtp(input: {
  email: string;
  code: string;
  purpose: OtpPurpose;
}): Promise<VerifyOtpResult> {
  const email = normalise(input.email);
  const row = await prisma.bctlabs_email_verifications.findFirst({
    where: { email, purpose: input.purpose, consumed_at: null },
    orderBy: { created_at: "desc" },
  });

  if (!row) return { ok: false, reason: "missing" };
  if (row.expires_at.getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many" };

  const matches = await bcrypt.compare(input.code.trim(), row.code_hash);
  if (!matches) {
    // Only count the attempt while the code is still unconsumed.
    await prisma.bctlabs_email_verifications.updateMany({
      where: { id: row.id, consumed_at: null },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "invalid" };
  }

  // Atomic single-use check: concurrent verifications must not all succeed.
  const consumed = await prisma.bctlabs_email_verifications.updateMany({
    where: { id: row.id, consumed_at: null },
    data: { consumed_at: new Date() },
  });
  if (consumed.count !== 1) return { ok: false, reason: "missing" };
  return { ok: true, payload: row.payload };
}

/** Returns the most recent pending signup payload so a resend can reuse it. */
export async function findPendingSignup(
  email: string,
): Promise<{ payload: unknown; secondsUntilResend: number } | null> {
  const row = await prisma.bctlabs_email_verifications.findFirst({
    where: { email: normalise(email), purpose: "signup", consumed_at: null },
    orderBy: { created_at: "desc" },
  });
  if (!row) return null;

  const elapsedSeconds = (Date.now() - row.created_at.getTime()) / 1000;
  return {
    payload: row.payload,
    secondsUntilResend: Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds)),
  };
}

export type EmailDelivery = { delivered: boolean };

/**
 * Sends the verification email through Brevo when configured. Without a mail
 * relay, local development logs the code to the server console; production
 * refuses signups rather than creating accounts that can never be verified.
 */
export async function sendVerificationEmail(email: string, code: string): Promise<EmailDelivery> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email delivery is not configured");
    }
    console.info(`[dev] Signup verification code for ${email}: ${code}`);
    return { delivered: false };
  }

  const fromEmail = process.env.MAIL_FROM_EMAIL || "no-reply@bctlabs.com";
  const fromName = process.env.MAIL_FROM_NAME || "BCTLABS";
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email }],
      subject: `Your BCTLABS verification code: ${code}`,
      htmlContent: `<p>Your BCTLABS verification code is <strong style="font-size:20px;letter-spacing:4px">${code}</strong>.</p><p>It expires in ${CODE_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.</p>`,
      textContent: `Your BCTLABS verification code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`,
    }),
  });

  if (!response.ok) {
    console.error("Brevo OTP email failed", response.status);
    throw new Error("Could not send the verification email");
  }
  return { delivered: true };
}
