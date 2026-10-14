"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

const REDIRECT_TO = "/admin/language";
const MAX_LENGTH = 255;

function parseId(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Mirrors `LanguageManager::store()` + `Language::updateOrCreate(['id' => ...])`.
 * A blank `language_id` means "create", otherwise the row is upserted.
 */
export async function saveLanguage(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("language_id"));
  const name = readField(formData, "name");
  const description = readField(formData, "description");

  // `name => required|string|max:255`, `description => required|string|max:255`.
  if (
    !name ||
    name.length > MAX_LENGTH ||
    !description ||
    description.length > MAX_LENGTH
  ) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(REDIRECT_TO);
  }

  if (id !== null) {
    await prisma.languages.upsert({
      where: { id },
      update: { name, description },
      create: { name, description },
    });
    await setFlash("success", "Country Updated Successfully.");
  } else {
    await prisma.languages.create({ data: { name, description } });
    await setFlash("success", "Country Created Successfully.");
  }

  revalidatePath(REDIRECT_TO);
  redirect(REDIRECT_TO);
}

export async function deleteLanguage(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  if (id !== null) {
    await prisma.languages.delete({ where: { id } }).catch(() => null);
    await setFlash("success", "Country Deleted Successfully.");
  }

  revalidatePath(REDIRECT_TO);
  redirect(REDIRECT_TO);
}
