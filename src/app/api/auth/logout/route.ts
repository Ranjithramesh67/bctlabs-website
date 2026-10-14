import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/session";

export const instant = false;

export async function POST() {
  return clearSessionCookie(NextResponse.json({ ok: true }));
}

/**
 * Forced sign-out used by server guards (e.g. a disabled account). Route
 * handlers may clear cookies, so the stale session is dropped before we land on
 * the login screen, which avoids a redirect loop through the proxy.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next");
  const destination = new URL(
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/login",
    request.url,
  );

  const reason = searchParams.get("reason");
  if (reason) {
    destination.searchParams.set("status", reason);
  }

  // Deleting on the response is required here: cookie mutations made through
  // `cookies()` are not merged into a user-created redirect response.
  return clearSessionCookie(NextResponse.redirect(destination));
}
