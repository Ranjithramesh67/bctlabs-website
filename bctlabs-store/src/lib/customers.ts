import "server-only";

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { toNumber } from "./format";

export type Customer = {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  registered: Date | null;
};

function bcryptFromWp(hash: string): string | null {
  if (hash.startsWith("$wp$")) return `$${hash.slice(4)}`; // $wp$2y$.. -> $2y$..
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) return hash;
  return null; // phpass ($P$/$H$) is not supported
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const bcryptHash = bcryptFromWp(hash);
  if (!bcryptHash) return false;
  try {
    return await bcrypt.compare(plain, bcryptHash);
  } catch {
    return false;
  }
}

/** Produce a WordPress/WooCommerce compatible `$wp$2y$` bcrypt hash. */
export async function hashPassword(plain: string): Promise<string> {
  const hash = await bcrypt.hash(plain, 10);
  return `$wp$2y$10$${hash.slice(7)}`;
}

function mapCustomer(
  user: { ID: bigint; user_email: string; user_login: string; display_name: string; user_registered: Date | null },
  meta: Map<string, string>,
): Customer {
  const first = meta.get("billing_first_name") || meta.get("first_name") || "";
  const last = meta.get("billing_last_name") || meta.get("last_name") || "";
  return {
    id: toNumber(user.ID),
    email: user.user_email,
    username: user.user_login,
    firstName: first,
    lastName: last,
    displayName: user.display_name || `${first} ${last}`.trim() || user.user_login,
    phone: meta.get("billing_phone") || "",
    registered: user.user_registered,
  };
}

async function metaFor(userId: bigint): Promise<Map<string, string>> {
  const rows = await prisma.wp_usermeta.findMany({
    where: {
      user_id: userId,
      meta_key: { in: ["billing_first_name", "billing_last_name", "billing_phone", "first_name", "last_name"] },
    },
    select: { meta_key: true, meta_value: true },
  });
  const map = new Map<string, string>();
  for (const r of rows) if (r.meta_key) map.set(r.meta_key, r.meta_value ?? "");
  return map;
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const user = await prisma.wp_users.findUnique({ where: { ID: BigInt(id) } });
  if (!user) return null;
  return mapCustomer(user, await metaFor(user.ID));
}

export async function authenticate(email: string, password: string): Promise<Customer | null> {
  const user = await prisma.wp_users.findFirst({
    where: { OR: [{ user_email: email }, { user_login: email }] },
  });
  if (!user) return null;
  if (!(await verifyPassword(password, user.user_pass))) return null;
  return mapCustomer(user, await metaFor(user.ID));
}

export async function emailExists(email: string): Promise<boolean> {
  const count = await prisma.wp_users.count({ where: { user_email: email } });
  return count > 0;
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<Customer> {
  const now = new Date();
  const passwordHash = await hashPassword(input.password);
  const base = input.email.split("@")[0].replace(/[^a-z0-9._-]/gi, "").toLowerCase() || "customer";
  let username = base;
  for (let i = 0; await prisma.wp_users.count({ where: { user_login: username } }); i += 1) {
    username = `${base}${i + 1}`;
  }

  const user = await prisma.wp_users.create({
    data: {
      user_login: username,
      user_pass: passwordHash,
      user_nicename: username,
      user_email: input.email,
      user_url: "",
      user_registered: now,
      user_activation_key: "",
      user_status: 0,
      display_name: `${input.firstName} ${input.lastName}`.trim() || username,
    },
  });

  await prisma.wp_usermeta.createMany({
    data: [
      { user_id: user.ID, meta_key: "nickname", meta_value: username },
      { user_id: user.ID, meta_key: "first_name", meta_value: input.firstName },
      { user_id: user.ID, meta_key: "last_name", meta_value: input.lastName },
      { user_id: user.ID, meta_key: "billing_first_name", meta_value: input.firstName },
      { user_id: user.ID, meta_key: "billing_last_name", meta_value: input.lastName },
      { user_id: user.ID, meta_key: "billing_email", meta_value: input.email },
      { user_id: user.ID, meta_key: "billing_phone", meta_value: input.phone ?? "" },
      { user_id: user.ID, meta_key: "wp_capabilities", meta_value: 'a:1:{s:8:"customer";b:1;}' },
      { user_id: user.ID, meta_key: "wp_user_level", meta_value: "0" },
    ],
  });

  return mapCustomer(user, await metaFor(user.ID));
}

export async function getCustomerCount(): Promise<number> {
  const rows = await prisma.wp_usermeta.count({ where: { meta_key: "wp_user_level", meta_value: "0" } });
  return rows;
}

/** Customer accounts only (excludes staff), newest first, for the admin area. */
export async function getCustomers(limit = 100): Promise<Customer[]> {
  const roleRows = await prisma.wp_usermeta.findMany({
    where: { meta_key: "wp_capabilities", meta_value: { contains: "customer" } },
    select: { user_id: true },
  });
  const ids = roleRows.map((r) => r.user_id);
  if (!ids.length) return [];

  const users = await prisma.wp_users.findMany({
    where: { ID: { in: ids } },
    orderBy: { user_registered: "desc" },
    take: Math.min(500, Math.max(1, limit)),
  });

  const metaRows = await prisma.wp_usermeta.findMany({
    where: {
      user_id: { in: users.map((u) => u.ID) },
      meta_key: { in: ["billing_first_name", "billing_last_name", "billing_phone", "first_name", "last_name"] },
    },
    select: { user_id: true, meta_key: true, meta_value: true },
  });
  const byUser = new Map<string, Map<string, string>>();
  for (const row of metaRows) {
    const key = row.user_id.toString();
    if (!byUser.has(key)) byUser.set(key, new Map());
    if (row.meta_key) byUser.get(key)!.set(row.meta_key, row.meta_value ?? "");
  }

  return users.map((u) => mapCustomer(u, byUser.get(u.ID.toString()) ?? new Map()));
}
