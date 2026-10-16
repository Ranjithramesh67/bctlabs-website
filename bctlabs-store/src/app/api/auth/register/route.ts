import { NextResponse } from "next/server";
import { z } from "zod";
import { emailExists, registerCustomer } from "@/lib/customers";
import { createSession } from "@/lib/session";

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

    const customer = await registerCustomer({ email, password, firstName, lastName, phone });
    await createSession({ customerId: customer.id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to create your account right now. Please try again." }, { status: 500 });
  }
}
