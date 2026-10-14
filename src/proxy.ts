import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  type SessionData,
  unsealSession,
} from "@/lib/session-shared";

/**
 * Laravel parity guards (see `app/Http/Kernel.php` + `routes/web.php`):
 * - `auth`: protected areas require a session.
 * - `guest`: signed-in users are pushed off the login/register screens.
 * - `checkRoleUrl`: the `client` role may not open the admin area.
 */
const GUEST_ROUTES = new Set(["/login", "/register", "/signin"]);
// Password reset routes use the `guest` middleware in Laravel, but
// `/password/confirm` requires `auth` (ConfirmPasswordController).
const GUEST_PASSWORD_PREFIXES = ["/password/reset", "/password/email"];
const PROTECTED_PREFIXES = ["/admin", "/client"];

const ADMIN_HOME = "/admin/dashboard";
const CLIENT_HOME = "/client/dashboard";

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function homeFor(roles: string[] | undefined): string {
  return roles?.includes("client") ? CLIENT_HOME : ADMIN_HOME;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const seal = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session: SessionData = seal ? await unsealSession(seal) : {};
  const signedIn = Boolean(session.userId);

  const isGuestRoute =
    GUEST_ROUTES.has(pathname) ||
    GUEST_PASSWORD_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

  if (isGuestRoute) {
    return signedIn
      ? NextResponse.redirect(new URL(homeFor(session.roles), request.url))
      : NextResponse.next();
  }

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  if (!signedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("intended", pathname);
    return NextResponse.redirect(login);
  }

  // checkRoleUrl: clients are redirected out of the admin area.
  if (pathname.startsWith("/admin") && session.roles?.includes("client")) {
    return NextResponse.redirect(new URL(CLIENT_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals and static files.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
