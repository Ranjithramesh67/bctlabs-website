"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { isUpload } from "@/lib/admin/upload";
import { storeUserMedia } from "@/lib/api-users";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

/** Spatie media collection used by `UserRepository::updateProfileImage()`. */
const PROFILE_COLLECTION = "profile";
/** Laravel `image` rule `max:2000` (kilobytes). */
const MAX_IMAGE_BYTES = 2000 * 1024;
const PROFILE_REDIRECT = "/admin/profile";
const ADMIN_HOME = "/admin/dashboard";

/** `UpdateUserProfileRequest`'s `email` `regex:` rule, replicated verbatim. */
const EMAIL_REGEX = /^[\w\-.+]+\@[a-zA-Z0-9.\-]+\.[a-zA-z0-9]{2,4}$/;
const IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png"];
const IMAGE_EXT = ["jpeg", "jpg", "png"];

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function nullable(value: string): string | null {
  return value.length > 0 ? value : null;
}

function imageExtension(file: File): string {
  return (file.name.split(".").pop() ?? "").toLowerCase();
}

/**
 * Mirror of Laravel's `preparePhoneNumber()` helper (`'+' . prefix_code . phone`).
 * The port does not load intl-tel-input, so a value that already includes the
 * international prefix is kept as-is instead of being prefixed again.
 */
function preparedPhone(phone: string, prefixCode: string): string | null {
  if (!phone) {
    return null;
  }
  return phone.startsWith("+") ? phone : `+${prefixCode}${phone}`;
}

async function fail(message: string, path = PROFILE_REDIRECT): Promise<never> {
  await setFlash("error", message);
  redirect(path);
}

export async function updateProfile(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();

  const firstName = text(formData, "first_name");
  const lastName = nullable(text(formData, "last_name"));
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const prefixCode = text(formData, "prefix_code");
  const facebook = nullable(text(formData, "facebook"));
  const linkedin = nullable(text(formData, "linkedin"));
  const skype = nullable(text(formData, "skype"));
  const image = formData.get("image");

  if (!firstName) {
    await fail("The first name field is required.");
  }
  if (!email) {
    await fail("The email field is required.");
  }
  if (!EMAIL_REGEX.test(email)) {
    await fail("Please enter valid email.");
  }

  const duplicate = await prisma.users.findFirst({
    where: { email, NOT: { id: currentUser.id } },
    select: { id: true },
  });
  if (duplicate) {
    await fail("The email has already been taken.");
  }

  if (isUpload(image)) {
    if (
      !IMAGE_MIME.includes(image.type) &&
      !IMAGE_EXT.includes(imageExtension(image))
    ) {
      await fail("The profile image must be a file of type: jpeg, jpg, png.");
    }
    if (image.size > MAX_IMAGE_BYTES) {
      await fail("Image size should not more than 2MB.");
    }
  }

  try {
    if (isUpload(image)) {
      await storeUserMedia(
        new Request("http://localhost/admin/profile"),
        currentUser.id,
        PROFILE_COLLECTION,
        image,
      );
    }

    await prisma.users.update({
      where: { id: currentUser.id },
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: preparedPhone(phone, prefixCode),
        facebook,
        linkedin,
        skype,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await fail(message);
  }

  await setFlash("success", t("user.profile_updated_successfully"));
  redirect(ADMIN_HOME);
}

export async function changePassword(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();

  const currentPassword = String(formData.get("password_current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (!currentPassword) {
    await fail("The current password field is required.");
  }
  if (password.length < 6 || confirmation.length < 6) {
    await fail("Password must contain at least 6 characters.");
  }
  if (password !== confirmation) {
    await fail("The password and confirm password must be matched.");
  }

  const user = await prisma.users.findUnique({
    where: { id: currentUser.id },
    select: { password: true },
  });
  const matches = user?.password
    ? await bcrypt.compare(currentPassword, user.password)
    : false;
  if (!matches) {
    await fail("Current password is invalid.");
  }

  await prisma.users.update({
    where: { id: currentUser.id },
    data: { password: await bcrypt.hash(password, 10), updated_at: new Date() },
  });

  await setFlash("success", t("user.password_updated_successfully"));
  redirect(PROFILE_REDIRECT);
}

export async function changeLanguage(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();

  const defaultLanguage = text(formData, "default_language");

  await prisma.users.update({
    where: { id: currentUser.id },
    data: {
      default_language: nullable(defaultLanguage),
      updated_at: new Date(),
    },
  });

  await setFlash("success", t("user.language_updated_successfully"));
  redirect(PROFILE_REDIRECT);
}
