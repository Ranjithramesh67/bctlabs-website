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

function parseId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Mirror of Laravel's `date` validation rule. */
function isValidDate(value: string): boolean {
  return value !== "" && !Number.isNaN(Date.parse(value));
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

async function stateExists(id: number): Promise<boolean> {
  const state = await prisma.states.findUnique({ where: { id } });
  return state !== null;
}

export async function storeSlider(formData: FormData): Promise<void> {
  await getCurrentUser();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const stateId = parseId(formData.get("state_id"));
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const image = formData.get("image");

  try {
    if (
      !title ||
      !description ||
      stateId === null ||
      !isValidDate(startDate) ||
      !isValidDate(endDate) ||
      invalidImage(image, true)
    ) {
      throw new Error("Invalid Request");
    }
    if (!(await stateExists(stateId))) {
      throw new Error("Invalid Request");
    }

    const imagePath = await saveUpload(
      image as File,
      `slider_image/${storedName(image as File)}`,
    );
    const now = new Date();

    await prisma.sliders.create({
      data: {
        slider_title: title,
        slider_description: description,
        state_id: stateId,
        start_date: startDate,
        end_date: endDate,
        slider_image: imagePath,
        created_at: now,
        updated_at: now,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await setFlash("error", `Error Creating Slider: ${message}`);
    redirect("/admin/slider_image/create");
  }

  await setFlash("success", "The Slider Image Created Successfully");
  redirect("/admin/slider_image");
}

export async function updateSlider(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const rawDescription = formData.get("description");
  const description = String(rawDescription ?? "").trim();
  const rawStateId = String(formData.get("state_id") ?? "").trim();
  const stateId = parseId(formData.get("state_id"));
  const rawStartDate = String(formData.get("start_date") ?? "").trim();
  const rawEndDate = String(formData.get("end_date") ?? "").trim();
  const image = formData.get("image");

  try {
    if (
      id === null ||
      !title ||
      rawDescription === null ||
      description === "" ||
      invalidImage(image, false)
    ) {
      throw new Error("Invalid Request");
    }

    const data = await prisma.sliders.findUnique({ where: { id } });
    if (!data) {
      throw new Error("Invalid Request");
    }

    const update: {
      slider_title: string;
      slider_description: string;
      updated_at: Date;
      state_id?: number;
      start_date?: string;
      end_date?: string;
      slider_image?: string;
    } = {
      slider_title: title,
      slider_description: description,
      updated_at: new Date(),
    };

    if (isUpload(image)) {
      update.slider_image = await saveUpload(
        image,
        `slider_image/${storedName(image)}`,
      );
    }

    if (rawStateId !== "") {
      if (stateId === null || !(await stateExists(stateId))) {
        throw new Error("Invalid Request");
      }
      update.state_id = stateId;
    }

    if (rawStartDate !== "") {
      if (!isValidDate(rawStartDate)) {
        throw new Error("Invalid Request");
      }
      update.start_date = rawStartDate;
    }

    if (rawEndDate !== "") {
      if (!isValidDate(rawEndDate)) {
        throw new Error("Invalid Request");
      }
      update.end_date = rawEndDate;
    }

    await prisma.sliders.update({ where: { id }, data: update });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await setFlash("error", `Error Updating Slider: ${message}`);
    redirect(`/admin/slider_image/${id ?? ""}/edit`);
  }

  await setFlash("success", "Slider updated successfully!");
  redirect("/admin/slider_image");
}

export async function deleteSlider(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  try {
    if (id === null) {
      throw new Error("Invalid Request");
    }
    const data = await prisma.sliders.findUnique({ where: { id } });
    if (!data) {
      throw new Error("Invalid Request");
    }
    await prisma.sliders.delete({ where: { id } });
    await setFlash("success", "The Slider Detail Delete Successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await setFlash("error", `Error Updating Category: ${message}`);
  }

  revalidatePath("/admin/slider_image");
  redirect("/admin/slider_image");
}
