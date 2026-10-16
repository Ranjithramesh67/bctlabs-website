import { NextResponse } from "next/server";

import { createAdminSession, isStaffUser } from "@/lib/admin-auth";
import { authenticate } from "@/lib/customers";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { email?: unknown; password?: unknown }
      | null;

    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const customer = await authenticate(email, password);
    if (!customer) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!(await isStaffUser(customer.id))) {
      return NextResponse.json(
        { error: "This account does not have admin access." },
        { status: 403 },
      );
    }

    await createAdminSession({
      userId: customer.id,
      email: customer.email,
      name: customer.displayName,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to sign in. Please try again." }, { status: 500 });
  }
}
