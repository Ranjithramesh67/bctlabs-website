import { NextResponse } from "next/server";
import { z } from "zod";

import { emailExists, registerCustomer } from "@/lib/customers";
import { verifyEmailOtp } from "@/lib/otp";
import { createSession } from "@/lib/session";

const bodySchema = z.object({
  email: z.email(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6 digit code"),
});

const payloadSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().trim().optional().default(""),
  passwordHash: z.string().min(1),
});

const ERRORS: Record<string, { status: number; message: string }> = {
  missing: { status: 400, message: "Request a new verification code." },
  expired: { status: 410, message: "That code has expired. Request a new one." },
  invalid: { status: 400, message: "That code is not correct. Check and try again." },
  too_many: { status: 429, message: "Too many attempts. Request a new code." },
};

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 422 });
  }

  const { email, code } = parsed.data;
  if (await emailExists(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const result = await verifyEmailOtp({ email, code, purpose: "signup" });
  if (!result.ok) {
    const failure = ERRORS[result.reason] ?? ERRORS.invalid;
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }

  const payload = payloadSchema.safeParse(result.payload);
  if (!payload.success) {
    return NextResponse.json(
      { error: "This verification has expired. Please create the account again." },
      { status: 410 },
    );
  }

  try {
    const customer = await registerCustomer({
      email,
      firstName: payload.data.firstName,
      lastName: payload.data.lastName,
      phone: payload.data.phone,
      passwordHash: payload.data.passwordHash,
    });
    await createSession({ customerId: customer.id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to create your account right now. Please try again." },
      { status: 500 },
    );
  }
}
