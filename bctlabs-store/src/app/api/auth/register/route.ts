import { NextResponse } from "next/server";
import { z } from "zod";
import { emailExists, hashPassword } from "@/lib/customers";
import { canExposeDevCode, createEmailOtp, sendVerificationEmail, type SignupPayload } from "@/lib/otp";

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().trim().optional().default(""),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid email, a password of at least 6 characters, and your name." },
        { status: 422 },
      );
    }

    const { email, password, firstName, lastName, phone } = parsed.data;
    if (await emailExists(email)) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Do not create the account yet: the email must be verified first.
    const payload: SignupPayload = {
      firstName,
      lastName,
      phone,
      passwordHash: await hashPassword(password),
    };
    const { code } = await createEmailOtp({
      email,
      purpose: "signup",
      payload,
    });

    let delivered = false;
    try {
      delivered = (await sendVerificationEmail(email, code)).delivered;
    } catch {
      return NextResponse.json(
        { error: "We could not send the verification email. Please try again shortly." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      requiresVerification: true,
      email,
      delivered,
      ...(canExposeDevCode() ? { devCode: code } : {}),
    });
  } catch {
    return NextResponse.json({ error: "Unable to create your account right now. Please try again." }, { status: 500 });
  }
}
