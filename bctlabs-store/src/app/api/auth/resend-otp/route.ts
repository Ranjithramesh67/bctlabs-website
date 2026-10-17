import { NextResponse } from "next/server";
import { z } from "zod";

import { canExposeDevCode, createEmailOtp, findPendingSignup, sendVerificationEmail } from "@/lib/otp";

const bodySchema = z.object({ email: z.email() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  const { email } = parsed.data;
  const pending = await findPendingSignup(email);
  if (!pending) {
    return NextResponse.json(
      { error: "No pending signup found. Please create the account again." },
      { status: 404 },
    );
  }
  if (pending.secondsUntilResend > 0) {
    return NextResponse.json(
      {
        error: `Please wait ${pending.secondsUntilResend}s before requesting another code.`,
        retryAfter: pending.secondsUntilResend,
      },
      { status: 429 },
    );
  }

  const { code } = await createEmailOtp({
    email,
    purpose: "signup",
    payload: pending.payload,
  });

  try {
    const { delivered } = await sendVerificationEmail(email, code);
    return NextResponse.json({
      ok: true,
      delivered,
      ...(canExposeDevCode() ? { devCode: code } : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "We could not send another email. Please try again shortly." },
      { status: 503 },
    );
  }
}
