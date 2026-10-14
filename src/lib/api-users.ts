import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import type { media, users } from "@/generated/prisma/client";
import { jsonSafe, laravelUrl } from "./api-format";
import { USER_MODEL_TYPE } from "./api-token";
import { prisma } from "./prisma";

function ucfirst(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

/**
 * Laravel's `getFullNameAttribute()` (`ucfirst(first_name).' '.ucfirst(last_name)`).
 * Note it does not trim, so a missing last name yields a trailing space.
 */
export function laravelFullName(
  firstName: string | null,
  lastName: string | null,
): string {
  return `${ucfirst(firstName ?? "")} ${ucfirst(lastName ?? "")}`;
}

const AVATAR_COLORS = ["329af0", "fc6369", "ffaa2e", "42c9af", "7d68f0"];

/**
 * Laravel's `getUserImageInitial()` fallback: the ui-avatars placeholder with a
 * colour derived from `id % 5`.
 */
export function avatarUrl(
  user: Pick<users, "id" | "first_name" | "last_name">,
): string {
  const background = AVATAR_COLORS[user.id % AVATAR_COLORS.length];
  const name = laravelFullName(user.first_name, user.last_name);
  return `https://ui-avatars.com/api/?name=${name}&size=100&rounded=true&color=fff&background=${background}`;
}

/** Spatie MediaLibrary URLs resolve to `<app>/storage/<media id>/<file>`. */
export function mediaUrl(
  request: Request,
  item: Pick<media, "id" | "file_name">,
): string {
  return laravelUrl(request, `storage/${item.id}/${item.file_name}`);
}

async function findUserMedia(
  userId: number,
  collection: string,
): Promise<media | null> {
  return prisma.media.findFirst({
    where: {
      model_type: USER_MODEL_TYPE,
      model_id: BigInt(userId),
      collection_name: collection,
    },
    orderBy: { id: "asc" },
  });
}

/**
 * Relative avatar URL for a logged-in user, matching Laravel's `image_url`
 * accessor: the profile media file, otherwise the generated ui-avatars
 * placeholder. Used by the admin navbar (the `users.image` column holds legacy
 * filesystem paths, so it must not be rendered directly).
 */
export async function userAvatarUrl(user: {
  id: number;
  fullName: string;
}): Promise<string> {
  const item = await findUserMedia(user.id, "profile");
  if (item) {
    return `/storage/${item.id}/${item.file_name}`;
  }
  const background = AVATAR_COLORS[user.id % AVATAR_COLORS.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&size=100&rounded=true&color=fff&background=${background}`;
}

/**
 * Laravel's `$user->image_url` accessor: the profile media URL, otherwise the
 * generated avatar placeholder.
 */
export async function profilePictureUrl(
  request: Request,
  user: Pick<users, "id" | "first_name" | "last_name">,
): Promise<string> {
  const item = await findUserMedia(user.id, "profile");
  return item ? mediaUrl(request, item) : avatarUrl(user);
}

/**
 * Laravel's `$user->logo_url` accessor: the logo media URL, otherwise the
 * bundled `images/avatar.png` asset.
 */
export async function logoUrl(
  request: Request,
  user: Pick<users, "id">,
): Promise<string> {
  const item = await findUserMedia(user.id, "logos");
  return item ? mediaUrl(request, item) : laravelUrl(request, "images/avatar.png");
}

function fileExtension(file: File): string {
  const extension = extname(file.name || "").toLowerCase();
  if (extension) {
    return extension;
  }
  const byMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
  };
  return byMime[file.type] ?? "";
}

/**
 * Replacement for Spatie's `clearMediaCollection()` + `addMedia()`: replace the
 * user's media rows for a collection and persist the uploaded file under
 * `public/storage/<media id>/`, returning the resulting URL.
 */
export async function storeUserMedia(
  request: Request,
  userId: number,
  collection: string,
  file: File,
): Promise<string> {
  await prisma.media.deleteMany({
    where: {
      model_type: USER_MODEL_TYPE,
      model_id: BigInt(userId),
      collection_name: collection,
    },
  });

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}_${randomBytes(4).toString("hex")}${fileExtension(file)}`;
  const now = new Date();
  const item = await prisma.media.create({
    data: {
      model_type: USER_MODEL_TYPE,
      model_id: BigInt(userId),
      collection_name: collection,
      name: file.name ? file.name.replace(/\.[^./]+$/, "") : "file",
      file_name: fileName,
      mime_type: file.type || null,
      disk: "public",
      size: BigInt(bytes.length),
      manipulations: "[]",
      custom_properties: "[]",
      responsive_images: "[]",
      generated_conversions: "[]",
      order_column: 1,
      created_at: now,
      updated_at: now,
    },
  });

  const directory = join(process.cwd(), "public", "storage", String(item.id));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, fileName), bytes);

  return mediaUrl(request, item);
}

/** The role returned by `$user->roles()->first()` on the API responses. */
export async function firstRoleName(userId: number): Promise<string | null> {
  const assignment = await prisma.model_has_roles.findFirst({
    where: { model_id: BigInt(userId), model_type: USER_MODEL_TYPE },
    orderBy: { role_id: "asc" },
  });
  if (!assignment) {
    return null;
  }
  const role = await prisma.roles.findUnique({
    where: { id: assignment.role_id },
  });
  return role?.name ?? null;
}

/** MySQL DATETIME string, as PDO returns it for non-cast date columns. */
function laravelRawDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

/**
 * Reproduce Eloquent's `User::toArray()` for endpoints that echo the raw model
 * (`user_update_profile`): every column except the hidden `password` /
 * `remember_token`, the declared casts applied, and the `full_name` /
 * `image_url` appends. Only `trial_ends_at` is not cast, so it stays a raw DB
 * datetime string.
 */
export async function serializeUser(
  request: Request,
  user: users,
): Promise<Record<string, unknown>> {
  const raw: Record<string, unknown> = { ...user };
  delete raw.password;
  delete raw.remember_token;
  if (raw.trial_ends_at instanceof Date) {
    raw.trial_ends_at = laravelRawDateTime(raw.trial_ends_at);
  }

  const serialized = jsonSafe(raw) as Record<string, unknown>;
  serialized.full_name = laravelFullName(user.first_name, user.last_name);
  serialized.image_url = await profilePictureUrl(request, user);
  return serialized;
}

/** Spatie's `$user->roles()->attach($role)`. */
export async function attachRoleByName(
  userId: number,
  roleName: string,
): Promise<void> {
  const role = await prisma.roles.findFirst({ where: { name: roleName } });
  if (!role) {
    return;
  }
  await prisma.model_has_roles.create({
    data: {
      role_id: role.id,
      model_id: BigInt(userId),
      model_type: USER_MODEL_TYPE,
    },
  });
}
