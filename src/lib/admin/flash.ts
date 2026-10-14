import "server-only";

import { cookies } from "next/headers";

export const FLASH_COOKIE = "admin_flash";

export type FlashMessage = {
  type: "success" | "error";
  message: string;
};

/**
 * Laravel `Flash::success()` / `Flash::error()` equivalent. Stored in a
 * short-lived, non-httpOnly cookie so the client can clear it after showing.
 */
export async function setFlash(
  type: FlashMessage["type"],
  message: string,
): Promise<void> {
  const store = await cookies();
  store.set(FLASH_COOKIE, JSON.stringify({ type, message }), {
    path: "/",
    maxAge: 30,
    httpOnly: false,
    sameSite: "lax",
  });
}

export async function readFlash(): Promise<FlashMessage | null> {
  const store = await cookies();
  const raw = store.get(FLASH_COOKIE)?.value;
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as FlashMessage;
    if (parsed && typeof parsed.message === "string") {
      return parsed;
    }
  } catch {
    // ignore malformed cookie
  }
  return null;
}
