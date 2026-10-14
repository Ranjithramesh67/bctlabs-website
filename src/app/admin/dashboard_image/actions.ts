"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { isUpload, saveUpload } from "@/lib/admin/upload";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const ALLOWED_EXT = ["jpeg", "jpg", "png", "gif"];
const MAX_BYTES = 10000 * 1024;

function parseId(value: FormDataEntryValue | null): bigint | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? BigInt(parsed) : null;
}

function fileExtension(file: File): string {
  return (file.name.split(".").pop() ?? "").toLowerCase();
}

/** Mirror of Laravel's `mimes:jpeg,jpg,png,gif` + `max:10000` rules. */
function hasAllowedFormat(file: File): boolean {
  return (
    ALLOWED_MIME.includes(file.type) ||
    ALLOWED_EXT.includes(fileExtension(file))
  );
}

function invalidImage(
  value: FormDataEntryValue | null,
  required: boolean,
): boolean {
  if (!isUpload(value)) {
    return required;
  }
  return !hasAllowedFormat(value) || value.size > MAX_BYTES;
}

/** Mirror of Laravel's `uniqid()_Str::uuid().ext` file naming. */
function storedName(file: File): string {
  return `${Date.now().toString(16)}_${randomUUID()}.${fileExtension(file)}`;
}

export async function storeDashboardImage(formData: FormData): Promise<void> {
  await getCurrentUser();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = formData.get("image");

  try {
    if (!title || !description || invalidImage(image, true)) {
      throw new Error("Invalid Request");
    }

    const imagePath = await saveUpload(
      image as File,
      `dashboard/${storedName(image as File)}`,
    );
    const now = new Date();

    await prisma.dashboard_slider.create({
      data: {
        title,
        description,
        image: imagePath,
        // The controller never sets `type`; MySQL (non-strict) fell back to the
        // first enum value, so new rows default to "customer".
        type: "customer",
        created_at: now,
        updated_at: now,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await setFlash("error", `Error Creating Dashboard: ${message}`);
    redirect("/admin/dashboard_image/create");
  }

  await setFlash("success", "The Dashboard Image Created Successfully");
  redirect("/admin/dashboard_image");
}

export async function updateDashboardImage(
  formData: FormData,
): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = formData.get("image");

  try {
    if (id === null || !title || !description || invalidImage(image, false)) {
      throw new Error("Invalid Request");
    }

    const data = await prisma.dashboard_slider.findUnique({ where: { id } });
    if (!data) {
      throw new Error("Invalid Request");
    }

    const update: {
      title: string;
      description: string;
      updated_at: Date;
      image?: string;
    } = {
      title,
      description,
      updated_at: new Date(),
    };

    if (isUpload(image)) {
      update.image = await saveUpload(
        image,
        `dashboard/${storedName(image)}`,
      );
    }

    await prisma.dashboard_slider.update({ where: { id }, data: update });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await setFlash("error", `Error Updating Dashboard: ${message}`);
    redirect(`/admin/dashboard_image/${id ?? ""}/edit`);
  }

  await setFlash("success", "Dashboard updated successfully!");
  redirect("/admin/dashboard_image");
}

export async function deleteDashboardImage(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  try {
    if (id === null) {
      throw new Error("Invalid Request");
    }
    const data = await prisma.dashboard_slider.findUnique({ where: { id } });
    if (!data) {
      throw new Error("Invalid Request");
    }
    await prisma.dashboard_slider.delete({ where: { id } });
    await setFlash("success", "The dashboard Detail Delete Successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await setFlash("error", `Error Updating Category: ${message}`);
  }

  revalidatePath("/admin/dashboard_image");
  redirect("/admin/dashboard_image");
}
