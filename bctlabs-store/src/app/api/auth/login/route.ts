import { NextResponse } from "next/server";
import { z } from "zod";
import { checkLoginAllowed, clearLoginFailures, recordLoginFailure } from "@/lib/auth-throttle";
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

    const email = parsed.data.email.trim().toLowerCase();
    const { password, remember } = parsed.data;

    const gate = await checkLoginAllowed(email);
    if (!gate.allowed) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${Math.ceil(gate.retryAfter / 60)} minutes.` },
        { status: 429, headers: { "Retry-After": String(gate.retryAfter) } },
      );
    }

    const customer = await authenticate(email, password);
    if (!customer) {
      await recordLoginFailure(email);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await clearLoginFailures(email);
    await createSession({ customerId: customer.id, remember });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now. Please try again." }, { status: 500 });
  }
}
