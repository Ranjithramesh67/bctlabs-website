"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { isUpload, saveUpload } from "@/lib/admin/upload";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SETTING_GROUPS, type SettingGroup } from "@/lib/admin/settings";
import { t } from "@/lib/i18n";

/** Reverse of `Setting::GROUP_ARRAY` (numeric group -> url group name). */
const GROUP_NAMES: Record<number, SettingGroup> = {
  [SETTING_GROUPS.general]: "general",
  [SETTING_GROUPS.company_information]: "company_information",
  [SETTING_GROUPS.note]: "note",
};

const UPLOAD_KEYS = ["logo", "favicon"] as const;

function fileExtension(file: File): string {
  return (file.name.split(".").pop() ?? "").toLowerCase();
}

/** Mirror of Laravel's `uniqid()_uuid.ext` file naming. */
function storedName(file: File): string {
  return `${Date.now().toString(16)}_${randomUUID()}.${fileExtension(file)}`;
}

/**
 * Mirror of `SettingRepository::updateSetting()`. Only existing `key` rows are
 * updated; `logo`/`favicon` are replaced when a file is uploaded.
 */
export async function updateSetting(formData: FormData): Promise<void> {
  await getCurrentUser();

  const group = Number(formData.get("group"));
  const groupName = GROUP_NAMES[group] ?? "general";

  const rows = await prisma.settings.findMany({
    select: { id: true, key: true },
  });
  const idsByKey = new Map(rows.map((row) => [row.key, row.id]));

  const values = new Map<string, string | null>();
  for (const [key, value] of formData.entries()) {
    if (key === "group" || key === "_token" || value instanceof File) {
      continue;
    }
    values.set(key, String(value));
  }

  // SettingController::update — prepend the `+` country prefix to the phone.
  if (group === SETTING_GROUPS.company_information) {
    const phone = values.get("phone") ?? "";
    const prefixCode = values.get("prefix_code") ?? "";
    values.set("phone", phone ? `+${prefixCode}${phone}` : null);
  }

  const now = new Date();
  for (const [key, value] of values) {
    if ((UPLOAD_KEYS as readonly string[]).includes(key)) {
      continue;
    }
    const id = idsByKey.get(key);
    if (id === undefined) {
      continue;
    }
    await prisma.settings.update({
      where: { id },
      data: { value, updated_at: now },
    });
  }

  // SettingRepository::fileUpload — store the upload and set the value to it.
  for (const key of UPLOAD_KEYS) {
    const file = formData.get(key);
    const id = idsByKey.get(key);
    if (id === undefined || !isUpload(file)) {
      continue;
    }
    const path = await saveUpload(file, `settings/${storedName(file)}`);
    await prisma.settings.update({
      where: { id },
      data: { value: path, updated_at: now },
    });
  }

  revalidatePath("/admin/settings");
  await setFlash("success", t("setting.setting_updated_successfully"));
  redirect(`/admin/settings?group=${groupName}`);
}
