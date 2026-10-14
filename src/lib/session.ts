import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  type SessionData,
  sealSession,
  ttlForSession,
  unsealSession,
} from "./session-shared";

export async function createSession(data: SessionData): Promise<void> {
  const ttl = ttlForSession(data);
  const seal = await sealSession(data, ttl);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, seal, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttl,
  });
}

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const seal = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!seal) {
    return {};
  }
  return unsealSession(seal);
}

/**
 * Clear the session cookie on an explicit response. Deletion must match the
 * attributes used when the cookie was created.
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
