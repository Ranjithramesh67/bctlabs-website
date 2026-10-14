"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { deleteUpload, isUpload, saveUpload } from "@/lib/admin/upload";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const MAX_BYTES = 10000 * 1024;

function parseId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isValidUrl(value: string): boolean {
  if (!value) {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function hasAllowedFormat(file: File): boolean {
  return ALLOWED_MIME.includes(file.type);
}

/** Mirror of Laravel's `uniqid()_uuid.ext` file naming. */
function storedName(file: File): string {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  return `${Date.now().toString(16)}_${randomUUID()}.${ext}`;
}

export async function storeSubCategory(formData: FormData): Promise<void> {
  await getCurrentUser();

  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const categoryId = parseId(formData.get("category_id"));
  const logo = formData.get("logo");
  const image = formData.get("image");

  if (
    !name ||
    name.length > 255 ||
    !isValidUrl(url) ||
    categoryId === null ||
    !isUpload(logo) ||
    !hasAllowedFormat(logo) ||
    logo.size > MAX_BYTES ||
    !isUpload(image) ||
    !hasAllowedFormat(image) ||
    image.size > MAX_BYTES
  ) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect("/admin/subcategory/create");
  }

  const logoPath = await saveUpload(
    logo,
    `sub_category_logos/${storedName(logo)}`,
  );
  const imagePath = await saveUpload(
    image,
    `sub_category_photos/${storedName(image)}`,
  );

  await prisma.sub_categories.create({
    data: {
      category_id: categoryId,
      sub_category_name: name,
      sub_category_logo: logoPath,
      sub_category_photo: imagePath,
      sub_category_url: url,
    },
  });

  await setFlash(
    "success",
    t("expense_category.expense_category_saved_successfully"),
  );
  redirect("/admin/get_subcategory");
}

export async function updateSubCategory(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const categoryId = parseId(formData.get("category_id"));
  const logo = formData.get("logo");
  const image = formData.get("image");

  const invalidLogo =
    isUpload(logo) && (!hasAllowedFormat(logo) || logo.size > MAX_BYTES);
  const invalidImage =
    isUpload(image) && (!hasAllowedFormat(image) || image.size > MAX_BYTES);

  if (
    id === null ||
    !name ||
    name.length > 255 ||
    !isValidUrl(url) ||
    categoryId === null ||
    invalidLogo ||
    invalidImage
  ) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect("/admin/get_subcategory");
  }

  const existing = await prisma.sub_categories.findUnique({ where: { id } });
  if (!existing) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect("/admin/get_subcategory");
  }

  const data: {
    category_id: number;
    sub_category_name: string;
    sub_category_url: string;
    sub_category_logo?: string;
    sub_category_photo?: string;
  } = {
    category_id: categoryId,
    sub_category_name: name,
    sub_category_url: url,
  };

  if (isUpload(logo)) {
    data.sub_category_logo = await saveUpload(
      logo,
      `sub_category_logos/${storedName(logo)}`,
    );
  }
  if (isUpload(image)) {
    data.sub_category_photo = await saveUpload(
      image,
      `sub_category_photos/${storedName(image)}`,
    );
  }

  await prisma.sub_categories.update({ where: { id }, data });

  await setFlash(
    "success",
    t("expense_category.expense_category_updated_successfully"),
  );
  redirect("/admin/get_subcategory");
}

export async function deleteSubCategory(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  if (id !== null) {
    const data = await prisma.sub_categories.findUnique({ where: { id } });
    if (data) {
      await prisma.sub_categories.update({
        where: { id },
        data: { is_deleted: true },
      });
      await deleteUpload(data.sub_category_logo);
      await deleteUpload(data.sub_category_photo);
      await setFlash(
        "success",
        t("expense_category.expense_category_deleted_successfully"),
      );
    }
  }
  revalidatePath("/admin/get_subcategory");
  redirect("/admin/get_subcategory");
}
