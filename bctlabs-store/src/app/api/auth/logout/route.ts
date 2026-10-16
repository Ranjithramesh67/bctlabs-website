import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearSession(response);
}
