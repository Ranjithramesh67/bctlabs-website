import "server-only";

import { cookies } from "next/headers";
import { sealData, unsealData } from "iron-session";

export type CartLine = { productId: number; quantity: number };

const COOKIE = "bctlabs_store_cart";
const TTL = 60 * 60 * 24 * 30;

function getPassword(): string {
  const password = process.env.SESSION_SECRET;
  if (!password) throw new Error("SESSION_SECRET environment variable is not set");
  return password;
}

export async function getCart(): Promise<CartLine[]> {
  const store = await cookies();
  const seal = store.get(COOKIE)?.value;
  if (!seal) return [];
  try {
    const data = await unsealData<{ lines?: CartLine[] }>(seal, { password: getPassword() });
    return Array.isArray(data.lines) ? data.lines : [];
  } catch {
    return [];
  }
}

export async function writeCart(lines: CartLine[]): Promise<void> {
  const cleaned = lines
    .filter((l) => Number.isFinite(l.productId) && l.productId > 0 && l.quantity > 0)
    .map((l) => ({ productId: Number(l.productId), quantity: Math.min(99, Math.floor(l.quantity)) }));
  const seal = await sealData({ lines: cleaned }, { password: getPassword(), ttl: TTL });
  const store = await cookies();
  store.set(COOKIE, seal, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL,
  });
}
