import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/customers";
import { createSession } from "@/lib/session";

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  remember: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email address and password." }, { status: 422 });
    }

    const { email, password, remember } = parsed.data;
    const customer = await authenticate(email, password);
    if (!customer) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession({ customerId: customer.id, remember });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now. Please try again." }, { status: 500 });
  }
}
