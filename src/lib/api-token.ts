import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import type { users } from "@/generated/prisma/client";
import { prisma } from "./prisma";

/** Morph type Laravel Sanctum stores in `personal_access_tokens.tokenable_type`. */
export const USER_MODEL_TYPE = "App\\Models\\User";

const TOKEN_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Laravel Sanctum uses `Str::random(40)` for the plain-text token. */
function randomTokenString(length = 40): string {
  const bytes = randomBytes(length);
  let token = "";
  for (let index = 0; index < length; index += 1) {
    token += TOKEN_ALPHABET[bytes[index] % TOKEN_ALPHABET.length];
  }
  return token;
}

function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

function constantTimeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

/**
 * Laravel's `Request::bearerToken()`: the raw value after a literal `Bearer `
 * prefix, or `null`/`""` when the scheme is missing.
 */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length);
}

/**
 * Create a Sanctum-compatible access token. Only the SHA-256 hash of the plain
 * token is persisted; the caller receives `"{id}|{plainTextToken}"`.
 */
export async function issueToken(
  userId: number,
  name: string,
  abilities: string[] = ["*"],
): Promise<string> {
  const plainToken = randomTokenString();
  const now = new Date();

  const token = await prisma.personal_access_tokens.create({
    data: {
      tokenable_type: USER_MODEL_TYPE,
      tokenable_id: BigInt(userId),
      name,
      token: hashToken(plainToken),
      abilities: JSON.stringify(abilities),
      expires_at: null,
      last_used_at: null,
      created_at: now,
      updated_at: now,
    },
  });

  return `${token.id}|${plainToken}`;
}

/**
 * Port of Sanctum's bearer-token guard: split `"{id}|{plain}"`, look the row up
 * by id, compare the stored hash, honour `expires_at`, touch `last_used_at` and
 * return the owning user. Returns `null` when the token is missing or invalid.
 */
export async function resolveToken(request: Request): Promise<users | null> {
  const bearer = bearerToken(request);
  if (!bearer) {
    return null;
  }

  let idPart: string | null = null;
  let plainPart = bearer;
  if (bearer.includes("|")) {
    [idPart, plainPart] = bearer.split("|", 2);
  }
  if (idPart !== null && !/^\d+$/.test(idPart)) {
    return null;
  }

  const token = idPart
    ? await prisma.personal_access_tokens.findUnique({
        where: { id: BigInt(idPart) },
      })
    : await prisma.personal_access_tokens.findUnique({
        where: { token: hashToken(plainPart) },
      });

  if (!token || !constantTimeEquals(token.token, hashToken(plainPart))) {
    return null;
  }
  if (token.tokenable_type !== USER_MODEL_TYPE) {
    return null;
  }
  if (token.expires_at && token.expires_at.getTime() <= Date.now()) {
    return null;
  }

  const user = await prisma.users.findUnique({
    where: { id: Number(token.tokenable_id) },
  });
  if (!user) {
    return null;
  }

  await prisma.personal_access_tokens.update({
    where: { id: token.id },
    data: { last_used_at: new Date() },
  });

  return user;
}

export type ApiAuth = { user: users } | { response: NextResponse };

/**
 * Port of the `auth:sanctum` guard plus `SanctumEnsureTokenMiddleware`:
 *  - no bearer token      -> 401 `{status:false, message:"Unauthorized. ..."}`
 *  - invalid/expired token -> 401 `{message:"Unauthenticated."}`
 */
export async function requireApiUser(request: Request): Promise<ApiAuth> {
  if (!bearerToken(request)) {
    return {
      response: NextResponse.json(
        {
          status: false,
          message: "Unauthorized. Please provide a valid authentication token.",
        },
        { status: 401 },
      ),
    };
  }

  const user = await resolveToken(request);
  if (!user) {
    return {
      response: NextResponse.json(
        { message: "Unauthenticated." },
        { status: 401 },
      ),
    };
  }

  return { user };
}
