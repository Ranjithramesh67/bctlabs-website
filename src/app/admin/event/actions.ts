"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import { setFlash } from "@/lib/admin/flash";
import { slugify } from "@/lib/admin/format";
import { deleteUpload, isUpload, saveUpload } from "@/lib/admin/upload";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Columns the original `deleteImage` accepts (in:... validation rule). */
const IMAGE_FIELDS = [
  "main_image",
  "start_image",
  "middle_image",
  "end_image",
  "image_4",
  "image_5",
  "image_6",
] as const;

type ImageField = (typeof IMAGE_FIELDS)[number];

/** Sub-image inputs on the create form, mapped to their DB column + filename suffix. */
const STORE_SUB_IMAGES: {
  input: string;
  suffix: string;
  column: ImageField;
}[] = [
  { input: "image_1", suffix: "first", column: "start_image" },
  { input: "image_2", suffix: "second", column: "middle_image" },
  { input: "image_3", suffix: "third", column: "end_image" },
  { input: "image_4", suffix: "fourth", column: "image_4" },
  { input: "image_5", suffix: "fifth", column: "image_5" },
  { input: "image_6", suffix: "sixth", column: "image_6" },
];

/** Update form inputs, mapped to their DB column + filename suffix (note `_last`). */
const UPDATE_IMAGES: { input: string; suffix: string; column: ImageField }[] = [
  { input: "main_image", suffix: "", column: "main_image" },
  { input: "start_image", suffix: "_first", column: "start_image" },
  { input: "middle_image", suffix: "_second", column: "middle_image" },
  { input: "end_image", suffix: "_last", column: "end_image" },
  { input: "image_4", suffix: "_fourth", column: "image_4" },
  { input: "image_5", suffix: "_fifth", column: "image_5" },
  { input: "image_6", suffix: "_sixth", column: "image_6" },
];

function parseId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Mirrors `$file->extension()`: the lower-cased client filename extension. */
function extensionOf(file: File): string {
  const dot = file.name.lastIndexOf(".");
  return dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "";
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function pagesUrl(page: string): string {
  return `/admin/event/index?pages=${encodeURIComponent(page)}`;
}

export async function storeEvent(formData: FormData): Promise<void> {
  await getCurrentUser();

  const page = String(formData.get("pages") ?? "");
  const title = text(formData, "title");
  const mainCondent = String(formData.get("main_condent") ?? "");
  const content = String(formData.get("content") ?? "");
  const image = formData.get("image");
  const image1 = formData.get("image_1");

  // `title`, `main_condent`, `image` and `content` are required by the
  // controller; `image_1` is required by the form/DB (`start_image` NOT NULL).
  if (
    !title ||
    title.length > 255 ||
    !mainCondent ||
    !content ||
    !isUpload(image) ||
    !isUpload(image1)
  ) {
    await setFlash("error", "The given data was invalid.");
    redirect(`/admin/event/create?pages=${encodeURIComponent(page)}`);
  }

  const slug = slugify(title);

  const mainImage = `events/main_image/${slug}.${extensionOf(image)}`;
  await saveUpload(image, mainImage);

  const subImages: Partial<Record<ImageField, string>> = {};
  for (const { input, suffix, column } of STORE_SUB_IMAGES) {
    const file = formData.get(input);
    if (!isUpload(file)) {
      continue;
    }
    const path = `events/sub_image/${slug}_${suffix}.${extensionOf(file)}`;
    await saveUpload(file, path);
    subImages[column] = path;
  }

  const orderbyNo = text(formData, "orderby_no");
  const categoryId = text(formData, "category_id");
  const price = text(formData, "price");

  await prisma.events.create({
    data: {
      title,
      type: page,
      main_condent: mainCondent,
      content,
      main_image: mainImage,
      start_image: subImages.start_image ?? mainImage,
      middle_image: subImages.middle_image ?? null,
      end_image: subImages.end_image ?? null,
      image_4: subImages.image_4 ?? null,
      image_5: subImages.image_5 ?? null,
      image_6: subImages.image_6 ?? null,
      orderby_no: orderbyNo ? Number(orderbyNo) : null,
      date: text(formData, "date") || null,
      venue: text(formData, "venue") || null,
      author_name: text(formData, "author_name") || null,
      category_id: categoryId ? BigInt(categoryId) : null,
      price: price || 0,
      is_deleted: 0,
    },
  });

  await setFlash("success", "Saved successfully");
  redirect(pagesUrl(page));
}

export async function updateEvent(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const page = String(formData.get("pages") ?? "");
  const title = text(formData, "title");

  if (id === null || !title || title.length > 255) {
    await setFlash("error", "The given data was invalid.");
    redirect(`/admin/event/${id ?? ""}/edit?pages=${encodeURIComponent(page)}`);
  }

  const event = await prisma.events.findUnique({ where: { id: BigInt(id) } });
  if (!event) {
    await setFlash("error", "Invalid Request");
    redirect(pagesUrl(page));
  }

  const slug = slugify(title);

  // Only overwrite images when a replacement file was uploaded; otherwise
  // the existing value is preserved (mirrors `$request->hasFile(...)`).
  const data: Prisma.eventsUpdateInput = {
    title,
    main_condent: String(formData.get("main_condent") ?? ""),
    content: String(formData.get("content") ?? ""),
    type: page,
    orderby_no: text(formData, "orderby_no")
      ? Number(text(formData, "orderby_no"))
      : null,
    date: text(formData, "date") || null,
    venue: text(formData, "venue") || null,
    author_name: text(formData, "author_name") || null,
    category_id: text(formData, "category_id")
      ? BigInt(text(formData, "category_id"))
      : null,
    price: text(formData, "price") || 0,
  };

  for (const { input, suffix, column } of UPDATE_IMAGES) {
    const file = formData.get(input);
    if (!isUpload(file)) {
      continue;
    }
    const folder =
      column === "main_image" ? "events/main_image" : "events/sub_image";
    const path = `${folder}/${slug}${suffix}.${extensionOf(file)}`;
    await saveUpload(file, path);
    data[column] = path;
  }

  await prisma.events.update({ where: { id: BigInt(id) }, data });

  await setFlash("success", "Updated successfully");
  redirect(pagesUrl(page));
}

export async function deleteEvent(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const page = String(formData.get("pages") ?? "");

  try {
    if (id === null) {
      throw new Error("Invalid id");
    }
    await prisma.events.update({
      where: { id: BigInt(id) },
      data: { is_deleted: 1 },
    });
    await setFlash("success", "Deleted successfully");
  } catch {
    await setFlash("error", "Invalid Request");
  }

  revalidatePath("/admin/event/index");
  redirect(pagesUrl(page));
}

export async function deleteEventImage(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const field = String(formData.get("field") ?? "");
  if (id === null || !IMAGE_FIELDS.includes(field as ImageField)) {
    return { success: false, message: "Invalid request" };
  }

  const event = await prisma.events.findUnique({ where: { id: BigInt(id) } });
  if (!event) {
    return { success: false, message: "Invalid request" };
  }

  const column = field as ImageField;
  if (event[column]) {
    await deleteUpload(event[column]);
  }

  try {
    await prisma.$executeRaw`UPDATE \`events\` SET ${Prisma.raw(`\`${column}\``)} = NULL WHERE \`id\` = ${BigInt(id)}`;
  } catch {
    return { success: false, message: "Something went wrong." };
  }

  revalidatePath(`/admin/event/${id}/edit`);
  return { success: true, message: "Image deleted successfully" };
}
