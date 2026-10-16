import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { sealData, unsealData } from "iron-session";

export type StoreSession = {
  customerId?: number;
  remember?: boolean;
};

const COOKIE = "bctlabs_store_session";
const DEFAULT_TTL = 60 * 60 * 24 * 7;
const REMEMBER_TTL = 60 * 60 * 24 * 30;

function getPassword(): string {
  const password = process.env.SESSION_SECRET;
  if (!password) throw new Error("SESSION_SECRET environment variable is not set");
  return password;
}

export async function createSession(data: StoreSession): Promise<void> {
  const ttl = data.remember ? REMEMBER_TTL : DEFAULT_TTL;
  const seal = await sealData(data, { password: getPassword(), ttl });
  const store = await cookies();
  store.set(COOKIE, seal, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttl,
  });
}

export async function getSession(): Promise<StoreSession> {
  const store = await cookies();
  const seal = store.get(COOKIE)?.value;
  if (!seal) return {};
  try {
    return await unsealData<StoreSession>(seal, { password: getPassword() });
  } catch {
    return {};
  }
}

export function clearSession(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
