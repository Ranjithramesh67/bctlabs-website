import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { sealData, unsealData } from "iron-session";

import { prisma } from "./prisma";

export type AdminSession = {
  userId?: number;
  email?: string;
  name?: string;
};

const COOKIE = "bctlabs_store_admin";
const TTL = 60 * 60 * 12; // 12 hours
const STAFF_CAPS = ["administrator", "shop_manager"];

function getPassword(): string {
  const password = process.env.SESSION_SECRET;
  if (!password) throw new Error("SESSION_SECRET environment variable is not set");
  return password;
}

/** WordPress stores capabilities as serialized PHP, e.g. `a:1:{s:13:"administrator";b:1;}`. */
export async function getUserRoles(userId: number): Promise<string[]> {
  const row = await prisma.wp_usermeta.findFirst({
    where: { user_id: BigInt(userId), meta_key: "wp_capabilities" },
    select: { meta_value: true },
  });
  const raw = row?.meta_value ?? "";
  if (!raw) return [];
  return STAFF_CAPS.filter((cap) => raw.includes(`"${cap}"`));
}

export async function isStaffUser(userId: number): Promise<boolean> {
  return (await getUserRoles(userId)).length > 0;
}

export async function createAdminSession(data: AdminSession): Promise<void> {
  const seal = await sealData(data, { password: getPassword(), ttl: TTL });
  const store = await cookies();
  store.set(COOKIE, seal, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL,
  });
}

export async function getAdminSession(): Promise<AdminSession> {
  const store = await cookies();
  const seal = store.get(COOKIE)?.value;
  if (!seal) return {};
  try {
    return await unsealData<AdminSession>(seal, { password: getPassword() });
  } catch {
    return {};
  }
}

/** Guard for admin server components: redirects to the login screen when unauthenticated. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session.userId) redirect("/admin/login");
  if (!(await isStaffUser(session.userId))) redirect("/admin/login");
  return session;
}

export function clearAdminSession(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
