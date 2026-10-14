import { sealData, unsealData } from "iron-session";

/**
 * Session payload shared by server code and the proxy (which cannot import
 * `next/headers`). Mirrors the minimum Laravel kept in the session for an
 * authenticated user. `remember` only affects the seal/cookie lifetime.
 */
export type SessionData = {
  userId?: number;
  roles?: string[];
  remember?: boolean;
};

export const SESSION_COOKIE_NAME = "bctlabs_session";

// Laravel: SESSION_LIFETIME defaults to 120 (minutes).
export const DEFAULT_TTL_SECONDS =
  60 * Number(process.env.SESSION_LIFETIME_MINUTES ?? 120);
// Laravel: "remember me" cookie is valid for 5 years.
export const REMEMBER_TTL_SECONDS = 60 * 60 * 24 * 365 * 5;

function getPassword(): string {
  const password = process.env.SESSION_SECRET;
  if (!password) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return password;
}

export function ttlForSession(data: SessionData): number {
  return data.remember ? REMEMBER_TTL_SECONDS : DEFAULT_TTL_SECONDS;
}

export function sealSession(data: SessionData, ttl: number): Promise<string> {
  return sealData(data, { password: getPassword(), ttl });
}

export async function unsealSession(seal: string): Promise<SessionData> {
  try {
    return await unsealData<SessionData>(seal, { password: getPassword() });
  } catch {
    // Tampered, expired or rotated password: treat as signed out.
    return {};
  }
}
