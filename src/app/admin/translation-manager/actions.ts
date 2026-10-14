"use server";

import {
  copyFile,
  mkdir,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

import { exportPhpArray, type PhpValue } from "./php-array";

const LANG_ROOT = path.join(process.cwd(), "lang");
const INDEX_PATH = "/admin/translation-manager";

function parseId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Guard against path traversal: language names are 2-letter short codes in the
 * original (the add modal is `maxlength=2`), so restrict to safe characters
 * before touching the filesystem.
 */
function isSafeLanguageName(name: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(name);
}

async function listLanguageDirs(): Promise<string[]> {
  const entries = await readdir(LANG_ROOT, { withFileTypes: true }).catch(
    () => [],
  );
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function languageDirExists(name: string): Promise<boolean> {
  const dirs = await listLanguageDirs();
  return dirs.includes(name);
}

async function fileExists(language: string, file: string): Promise<boolean> {
  const entries = await readdir(path.join(LANG_ROOT, language), {
    withFileTypes: true,
  }).catch(() => null);
  if (entries === null) {
    return false;
  }
  return entries.some((entry) => entry.isFile() && entry.name === file);
}

/** `TranslationManagerController::store` (DB row + copy of `lang/en/*`). */
export async function storeLanguage(formData: FormData): Promise<void> {
  await getCurrentUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name || !isSafeLanguageName(name)) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(INDEX_PATH);
  }

  // `TranslationManagerRepository::store` rejects an already existing folder.
  const existing = await listLanguageDirs();
  if (existing.some((dir) => dir.toLowerCase() === name.toLowerCase())) {
    await setFlash("error", `${name} language already exists.`);
    redirect(INDEX_PATH);
  }

  await prisma.languages.create({ data: { name } });

  const targetDir = path.join(LANG_ROOT, name);
  const englishDir = path.join(LANG_ROOT, "en");
  await mkdir(targetDir, { recursive: true });
  const englishFiles = await readdir(englishDir, { withFileTypes: true });
  for (const entry of englishFiles) {
    if (entry.isFile()) {
      await copyFile(
        path.join(englishDir, entry.name),
        path.join(targetDir, entry.name),
      );
    }
  }

  await setFlash(
    "success",
    t("translator_manager.language_added_successfully"),
  );
  revalidatePath(INDEX_PATH);
  redirect(INDEX_PATH);
}

/** `TranslationManagerRepository::updateLanguage` (rename row + move folder). */
export async function updateLanguage(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("language_id"));
  const name = String(formData.get("name") ?? "").trim();
  const language =
    id === null
      ? null
      : await prisma.languages.findUnique({ where: { id } });

  if (!language || !name || !isSafeLanguageName(name)) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(INDEX_PATH);
  }

  const oldName = language.name;
  const renamed = name !== oldName;

  if (renamed && (await languageDirExists(name))) {
    await setFlash(
      "error",
      `${name} ${t("placeholder.lang_already_exists")}`,
    );
    redirect(INDEX_PATH);
  }

  await prisma.languages.update({ where: { id: language.id }, data: { name } });

  if (renamed) {
    await rename(path.join(LANG_ROOT, oldName), path.join(LANG_ROOT, name)).catch(
      () => null,
    );
  }

  await setFlash(
    "success",
    t("translator_manager.language_updated_successfully"),
  );
  revalidatePath(INDEX_PATH);
  redirect(INDEX_PATH);
}

/** `TranslationManagerController::destroy` (delete folder + row). */
export async function destroyLanguage(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const language =
    id === null
      ? null
      : await prisma.languages.findUnique({ where: { id } });

  if (!language) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(INDEX_PATH);
  }

  if (language.is_default) {
    await setFlash("error", "Default Language can't be deleted.");
    redirect(INDEX_PATH);
  }

  const enabledUsers = await prisma.users.findMany({
    where: { is_enable: true },
    select: { default_language: true },
  });
  if (enabledUsers.some((user) => user.default_language === language.name)) {
    await setFlash("error", "Uses Language can't be deleted.");
    redirect(INDEX_PATH);
  }

  if (isSafeLanguageName(language.name)) {
    await rm(path.join(LANG_ROOT, language.name), {
      recursive: true,
      force: true,
    }).catch(() => null);
  }

  await prisma.languages.delete({ where: { id: language.id } });

  await setFlash("success", "Language deleted successfully.");
  revalidatePath(INDEX_PATH);
  redirect(INDEX_PATH);
}

/**
 * Rebuild the nested array from the submitted `key` / `key[nested]` inputs and
 * write it back in `var_export` format (`TranslationManagerController::updateTranslation`).
 */
function collectTranslations(formData: FormData): Record<string, PhpValue> {
  const ignored = new Set([
    "_token",
    "translate_language",
    "file_name",
    "language_id",
  ]);
  const result: Record<string, PhpValue> = {};

  for (const [key, value] of formData.entries()) {
    if (ignored.has(key) || typeof value !== "string") {
      continue;
    }
    const nested = /^([^[\]]+)\[([^[\]]+)\]$/.exec(key);
    if (nested) {
      const [, parent, child] = nested;
      const bucket = result[parent];
      if (bucket && typeof bucket === "object") {
        (bucket as Record<string, PhpValue>)[child] = value;
      } else {
        result[parent] = { [child]: value };
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/** `TranslationManagerController::updateTranslation`. */
export async function updateTranslation(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("language_id"));
  const language =
    id === null
      ? null
      : await prisma.languages.findUnique({ where: { id } });
  if (!language) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(INDEX_PATH);
  }

  const fileName = String(formData.get("file_name") ?? "");
  const translationPath = path.join(LANG_ROOT, language.name);
  if (!fileName || !(await fileExists(language.name, fileName))) {
    await setFlash("error", "File not found.");
    redirect(`/admin/language/translation/${language.id}`);
  }

  const translations = collectTranslations(formData);
  const content = `<?php return ${exportPhpArray(translations)}?>`;
  await writeFile(path.join(translationPath, fileName), content);

  await setFlash(
    "success",
    t("translator_manager.language_updated_successfully"),
  );
  revalidatePath(`/admin/language/translation/${language.id}`);
  redirect(`/admin/language/translation/${language.id}`);
}
