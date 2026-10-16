import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().trim().optional().default(""),
  subject: z.string().trim().optional().default(""),
  message: z.string().trim().min(5),
});

/** Health/method fallback. Never exposes stored messages. */
export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide your name, a valid email address, and a message of at least 5 characters." },
      { status: 400 },
    );
  }

  const { name, email, phone, subject, message } = parsed.data;
  try {
    // No Prisma model exists for this table - insert with raw SQL.
    await prisma.$executeRaw`INSERT INTO bctlabs_contact_messages (name, email, phone, subject, message) VALUES (${name}, ${email}, ${phone}, ${subject}, ${message})`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to send your message right now. Please try again." },
      { status: 500 },
    );
  }
}
