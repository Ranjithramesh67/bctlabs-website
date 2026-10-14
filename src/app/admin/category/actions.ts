"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

function parseId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function storeCategory(formData: FormData): Promise<void> {
  await getCurrentUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 255) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect("/admin/category/create");
  }

  await prisma.categories.create({
    data: { category_name: name },
  });

  await setFlash(
    "success",
    t("expense_category.expense_category_saved_successfully"),
  );
  redirect("/admin/get_category");
}

export async function updateCategory(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (id === null || !name || name.length > 255) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect("/admin/get_category");
  }

  await prisma.categories.update({
    where: { id },
    data: { category_name: name },
  });

  await setFlash(
    "success",
    t("expense_category.expense_category_updated_successfully"),
  );
  redirect("/admin/get_category");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  if (id !== null) {
    await prisma.categories.delete({ where: { id } }).catch(() => null);
    await setFlash(
      "success",
      t("expense_category.expense_category_deleted_successfully"),
    );
  }
  revalidatePath("/admin/get_category");
  redirect("/admin/get_category");
}
