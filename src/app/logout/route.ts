import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/session";

export const instant = false;

/**
 * Laravel `route('logout')` (`LoginController@logout`) -> POST /logout.
 *
 * Duplicates the cookie-clearing logic from `src/app/api/auth/logout/route.ts`
 * (that module only re-exports route handlers, which cannot be imported into
 * another route handler). Behaviour is identical: drop the session cookie and
 * send the browser to the login screen.
 */
export async function POST(request: Request) {
  return clearSessionCookie(NextResponse.redirect(new URL("/login", request.url)));
}
