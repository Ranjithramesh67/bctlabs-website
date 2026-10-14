"use server";

import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { deleteUpload, isUpload, saveUpload } from "@/lib/admin/upload";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

/** Spatie morph type used by the role/permission pivot tables. */
const USER_MODEL_TYPE = "App\\Models\\User";
const STAFF_ROLE = "staff_member";
const INDEX_PATH = "/admin/members";

/** `User::$rules` / `$editRules` image rule: `mimes:jpeg,jpg,png|max:2000`. */
const IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png"];
const IMAGE_EXT = ["jpeg", "jpg", "png"];
const MAX_IMAGE_BYTES = 2000 * 1024;

/** `CreateUserRequest::$rules['email']` regex, replicated verbatim. */
const EMAIL_REGEX = /^[\w\-.+]+\@[a-zA-Z0-9.\-]+\.[a-zA-z0-9]{2,4}$/;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function nullable(value: string): string | null {
  return value.length > 0 ? value : null;
}

function parseId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function imageExtension(file: File): string {
  const dot = file.name.lastIndexOf(".");
  return dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "";
}

function invalidImage(file: File): string | null {
  if (
    !IMAGE_MIME.includes(file.type) &&
    !IMAGE_EXT.includes(imageExtension(file))
  ) {
    return "The image must be a file of type: jpeg, jpg, png.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image size should not more than 2MB.";
  }
  return null;
}

/** Persist the uploaded picture under `public/uploads/members/`. */
async function storeMemberImage(file: File): Promise<string> {
  const name = `${Date.now()}_${randomUUID()}.${imageExtension(file)}`;
  return saveUpload(file, `uploads/members/${name}`);
}

/** Only allow redirecting back into this module (avoids open redirects). */
function backTo(formData: FormData): string {
  const raw = String(formData.get("redirect_to") ?? "");
  return raw.startsWith(INDEX_PATH) ? raw : INDEX_PATH;
}

async function fail(message: string, path: string = INDEX_PATH): Promise<never> {
  await setFlash("error", message);
  redirect(path);
}

/** Mirror of Laravel's `removeSpaceFromPhoneNumber()`. */
function removeSpaces(phone: string): string {
  return phone.replace(/ /g, "");
}

/**
 * The controller's `sendEmailVerificationNotification()` call is kept
 * best-effort: no mailer is ported, so this is intentionally a no-op.
 */
async function sendWelcomeEmail(): Promise<void> {
  // Mail delivery is not part of the port.
}

/** Replace the user's `staff_member` role assignment (Spatie `roles()->sync`). */
async function syncStaffRole(userId: number): Promise<void> {
  const role = await prisma.roles.findFirst({ where: { name: STAFF_ROLE } });
  await prisma.model_has_roles.deleteMany({
    where: { model_id: BigInt(userId), model_type: USER_MODEL_TYPE },
  });
  if (role) {
    await prisma.model_has_roles.create({
      data: {
        role_id: role.id,
        model_id: BigInt(userId),
        model_type: USER_MODEL_TYPE,
      },
    });
  }
}

/** Replace the user's direct permissions (Spatie `permissions()->sync`). */
async function syncPermissions(
  userId: number,
  permissionIds: string[],
): Promise<void> {
  await prisma.model_has_permissions.deleteMany({
    where: { model_id: BigInt(userId), model_type: USER_MODEL_TYPE },
  });
  const ids = permissionIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
  if (ids.length === 0) {
    return;
  }
  await prisma.model_has_permissions.createMany({
    data: ids.map((id) => ({
      permission_id: BigInt(id),
      model_id: BigInt(userId),
      model_type: USER_MODEL_TYPE,
    })),
  });
}

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

export async function storeMember(formData: FormData): Promise<void> {
  await getCurrentUser();

  const firstName = text(formData, "first_name").toUpperCase();
  const lastName = nullable(text(formData, "last_name").toUpperCase());
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "").toUpperCase();
  const confirmation = String(formData.get("password_confirmation") ?? "");
  const phone = removeSpaces(String(formData.get("phone") ?? ""));
  const image = formData.get("image");
  const back = backTo(formData);

  // Validation order mirrors `CreateUserRequest` + `User::$rules`.
  if (!firstName) {
    return fail("The first name field is required.", back);
  }
  if (!phone) {
    return fail("The phone field is required.", back);
  }
  if (await prisma.users.findFirst({ where: { phone }, select: { id: true } })) {
    return fail("The phone has already been taken.", back);
  }
  if (!email) {
    return fail("The email field is required.", back);
  }
  if (!EMAIL_REGEX.test(email)) {
    return fail("Please enter valid email.", back);
  }
  if (await prisma.users.findFirst({ where: { email }, select: { id: true } })) {
    return fail("The email has already been taken.", back);
  }
  if (!password) {
    return fail("The password field is required.", back);
  }
  if (password !== confirmation.toUpperCase()) {
    return fail("The password and confirm password must match", back);
  }
  if (password.length < 6) {
    return fail("The password must be at least 6 characters.", back);
  }
  if (isUpload(image)) {
    const invalid = invalidImage(image);
    if (invalid) {
      return fail(invalid, back);
    }
  }

  const sendWelcome = Boolean(formData.get("send_welcome_email"));
  const staffMember = Boolean(formData.get("staff_member"));
  const now = new Date();
  const imagePath = isUpload(image) ? await storeMemberImage(image) : null;

  const member = await prisma.users.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      facebook: nullable(text(formData, "facebook").toUpperCase()),
      linkedin: nullable(text(formData, "linkedin").toUpperCase()),
      skype: nullable(text(formData, "skype").toUpperCase()),
      css_no: nullable(text(formData, "css_no").toUpperCase()),
      branch: nullable(text(formData, "branch")),
      default_language: nullable(
        text(formData, "default_language").toUpperCase(),
      ),
      image: imagePath,
      send_welcome_email: sendWelcome,
      staff_member: staffMember,
      created_at: now,
      updated_at: now,
    },
  });

  if (sendWelcome) {
    await sendWelcomeEmail();
  }

  await syncStaffRole(member.id);
  await syncPermissions(member.id, formData.getAll("permissions").map(String));

  await setFlash("success", t("member.member_saved_successfully"));
  revalidatePath(INDEX_PATH);
  redirect(INDEX_PATH);
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateMember(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();

  const id = parseId(formData.get("id"));
  const back = backTo(formData);
  if (id === null) {
    return fail(t("member.member_not_found"), back);
  }

  const member = await prisma.users.findUnique({ where: { id } });
  if (!member) {
    return fail(t("member.member_not_found"), back);
  }
  if (currentUser.roles.includes(STAFF_ROLE) && member.is_admin) {
    redirect(INDEX_PATH);
  }

  const firstName = text(formData, "first_name").toUpperCase();
  const lastName = nullable(text(formData, "last_name").toUpperCase());
  const email = text(formData, "email");
  const phone = removeSpaces(String(formData.get("phone") ?? ""));
  const image = formData.get("image");

  if (!firstName) {
    return fail("The first name field is required.", back);
  }
  if (!phone) {
    return fail("The phone field is required.", back);
  }
  const phoneDuplicate = await prisma.users.findFirst({
    where: { phone, NOT: { id } },
    select: { id: true },
  });
  if (phoneDuplicate) {
    return fail("The phone has already been taken.", back);
  }
  if (!email) {
    return fail("The email field is required.", back);
  }
  if (!EMAIL_REGEX.test(email)) {
    return fail("Please enter valid email.", back);
  }
  const emailDuplicate = await prisma.users.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (emailDuplicate) {
    return fail("The email has already been taken.", back);
  }
  if (isUpload(image)) {
    const invalid = invalidImage(image);
    if (invalid) {
      return fail(invalid, back);
    }
  }

  const sendWelcome = Boolean(formData.get("send_welcome_email"));
  const staffMember = Boolean(formData.get("staff_member"));
  const now = new Date();

  let imagePath: string | undefined;
  if (isUpload(image)) {
    if (member.image?.startsWith("uploads/")) {
      await deleteUpload(member.image);
    }
    imagePath = await storeMemberImage(image);
  }

  await prisma.users.update({
    where: { id },
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      facebook: nullable(text(formData, "facebook").toUpperCase()),
      linkedin: nullable(text(formData, "linkedin").toUpperCase()),
      skype: nullable(text(formData, "skype").toUpperCase()),
      css_no: nullable(text(formData, "css_no").toUpperCase()),
      branch: nullable(text(formData, "branch")),
      default_language: nullable(
        text(formData, "default_language").toUpperCase(),
      ),
      ...(imagePath ? { image: imagePath } : {}),
      send_welcome_email: sendWelcome,
      staff_member: staffMember,
      updated_at: now,
    },
  });

  await syncStaffRole(id);
  // The controller only syncs when at least one permission was submitted.
  const permissions = formData.getAll("permissions").map(String);
  if (permissions.length > 0) {
    await syncPermissions(id, permissions);
  }

  await setFlash("success", t("member.member_updated_successfully"));
  revalidatePath(INDEX_PATH);
  redirect(back);
}

/* -------------------------------------------------------------------------- */
/* Destroy                                                                    */
/* -------------------------------------------------------------------------- */

export async function destroyMember(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();
  const back = backTo(formData);

  const id = parseId(formData.get("id"));
  if (id === null) {
    return fail(t("member.member_not_found"), back);
  }

  const member = await prisma.users.findUnique({ where: { id } });
  if (!member) {
    return fail(t("member.member_not_found"), back);
  }

  if (member.email && member.email === currentUser.email) {
    await setFlash("error", "Login member can't deleted.");
    redirect(back);
  }

  try {
    await prisma.users.delete({ where: { id } });
    await prisma.model_has_roles.deleteMany({
      where: { model_id: BigInt(id), model_type: USER_MODEL_TYPE },
    });
    await prisma.model_has_permissions.deleteMany({
      where: { model_id: BigInt(id), model_type: USER_MODEL_TYPE },
    });
    if (member.image?.startsWith("uploads/")) {
      await deleteUpload(member.image);
    }
  } catch {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(back);
  }

  await setFlash("success", "Member deleted successfully.");
  revalidatePath(INDEX_PATH);
  redirect(back);
}

/* -------------------------------------------------------------------------- */
/* Status toggle                                                              */
/* -------------------------------------------------------------------------- */

export async function toggleAdministrator(formData: FormData): Promise<void> {
  await getCurrentUser();
  const back = backTo(formData);

  const id = parseId(formData.get("id"));
  if (id === null) {
    return fail(t("member.member_not_found"), back);
  }

  const member = await prisma.users.findUnique({ where: { id } });
  if (!member) {
    return fail(t("member.member_not_found"), back);
  }

  await prisma.users.update({
    where: { id },
    data: { is_enable: !member.is_enable, updated_at: new Date() },
  });

  await setFlash("success", t("member.member_status_updated_successfully"));
  revalidatePath(INDEX_PATH);
  redirect(back);
}

/* -------------------------------------------------------------------------- */
/* Block                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Mirrors `MemberController::blocked()` (which `dd()`s its request before
 * running) and the Livewire `Members::store()` modal handler. The `dd()` is a
 * bug in the original; blocking is implemented for real here.
 */
export async function blockMember(formData: FormData): Promise<void> {
  await getCurrentUser();
  const back = backTo(formData);

  const userId = parseId(formData.get("user_id"));
  const reason = text(formData, "reason");
  if (userId === null || !reason || reason.length > 255) {
    return fail(t("member.member_not_found"), back);
  }

  const member = await prisma.users.findUnique({ where: { id: userId } });
  if (!member) {
    return fail(t("member.member_not_found"), back);
  }

  await prisma.users.update({
    where: { id: userId },
    data: { isBlocked: 1, blocked_reason: reason, updated_at: new Date() },
  });

  await setFlash("success", "User Blocked Successfully.");
  revalidatePath(INDEX_PATH);
  redirect(back);
}
