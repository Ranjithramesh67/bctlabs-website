import "server-only";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "./prisma";
import { getSession } from "./session";

/** Spatie morph type stored in `model_has_roles.model_type`. */
const USER_MODEL_TYPE = "App\\Models\\User";

/** Laravel `RouteServiceProvider` home routes. */
export const ADMIN_HOME = "/admin/dashboard";
export const CLIENT_HOME = "/client/dashboard";
export const LOGIN_ROUTE = "/login";
/** Clears the session then lands on login (used for disabled/stale sessions). */
export const FORCED_LOGOUT_ROUTE = "/api/auth/logout";

export const DISABLED_ACCOUNT_MESSAGE =
  "Your Account is currently disabled, please contact to administrator.";

export type CurrentUser = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  isEnable: boolean;
  isAdmin: boolean;
  defaultLanguage: string;
  roles: string[];
};

export function toCurrentUser(
  user: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
    is_enable: boolean;
    is_admin: boolean;
    default_language: string | null;
  },
  roles: string[],
): CurrentUser {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: fullName(user.first_name, user.last_name),
    email: user.email,
    phone: user.phone,
    image: user.image,
    isEnable: user.is_enable,
    isAdmin: user.is_admin,
    defaultLanguage: user.default_language ?? "en",
    roles,
  };
}

function fullName(firstName: string | null, lastName: string | null): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name.length > 0 ? name : "";
}

export function hasRole(user: CurrentUser | null, role: string | string[]): boolean {
  if (!user) {
    return false;
  }
  const roles = Array.isArray(role) ? role : [role];
  return user.roles.some((name) => roles.includes(name));
}

/**
 * Laravel's `LoginController::sendLoginResponse` redirects `client` users to
 * the client dashboard and everyone else to the admin dashboard.
 */
export function homeForUser(user: CurrentUser): string {
  return hasRole(user, "client") ? CLIENT_HOME : ADMIN_HOME;
}

export async function getUserRoles(userId: number): Promise<string[]> {
  const assignments = await prisma.model_has_roles.findMany({
    where: { model_id: BigInt(userId), model_type: USER_MODEL_TYPE },
    select: { role_id: true },
  });
  if (assignments.length === 0) {
    return [];
  }

  const roles = await prisma.roles.findMany({
    where: { id: { in: assignments.map((row) => row.role_id) } },
    select: { name: true },
    orderBy: { id: "asc" },
  });
  return roles.map((role) => role.name);
}

/**
 * Verify credentials against the existing Laravel bcrypt hashes. Returns the
 * user id when the email/password pair is valid, otherwise `null`.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<number | null> {
  const user = await prisma.users.findUnique({
    where: { email },
    select: { id: true, password: true },
  });
  if (!user?.password) {
    return null;
  }

  const matches = await bcrypt.compare(password, user.password);
  return matches ? user.id : null;
}

const userSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  phone: true,
  image: true,
  is_enable: true,
  is_admin: true,
  default_language: true,
} as const;

/**
 * Load a single user (with roles) by id, regardless of enabled status.
 */
export async function loadUserById(userId: number): Promise<CurrentUser | null> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: userSelect,
  });
  if (!user) {
    return null;
  }

  return toCurrentUser(user, await getUserRoles(user.id));
}

async function resolveSession(): Promise<{
  user: CurrentUser | null;
  signedIn: boolean;
}> {
  const { userId } = await getSession();
  if (!userId) {
    return { user: null, signedIn: false };
  }

  const user = await loadUserById(userId);
  return { user: user?.isEnable ? user : null, signedIn: true };
}

/**
 * Read the session and load the current user. Returns `null` when signed out,
 * when the account no longer exists, or when it has been disabled.
 */
export async function loadCurrentUser(): Promise<CurrentUser | null> {
  return (await resolveSession()).user;
}

/**
 * For page/data access: resolve the current user or redirect to the login
 * screen. Marked `use cache: private` so the per-session result is cached in
 * the browser only (see the Cache Components authentication guide).
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  "use cache: private";

  const { user, signedIn } = await resolveSession();
  if (!user) {
    // Route handler clears the stale cookie before rendering /login, so the
    // guest guard in the proxy can't bounce us straight back here.
    const reason = signedIn ? "disabled" : "session";
    redirect(`${FORCED_LOGOUT_ROUTE}?reason=${reason}&next=${LOGIN_ROUTE}`);
  }
  return user;
}
