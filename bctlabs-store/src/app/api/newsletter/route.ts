import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.email(),
  source: z.string().trim().max(50).optional().default("homepage"),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  try {
    await prisma.bctlabs_newsletter_subscribers.upsert({
      where: { email },
      create: { email, source: parsed.data.source },
      update: {},
    });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return NextResponse.json({ error: "Could not save your email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
