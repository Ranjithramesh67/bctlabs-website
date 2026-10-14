import { NextResponse } from "next/server";

import {
  hasMime,
  isBlank,
  isBooleanLaravel,
  isImageFile,
  isInteger,
  isNumericLaravel,
  isValidUrl,
  laravelTinyintBool,
  readCommerceBody,
  serializeCommerce,
  storeFileToPublic,
  toNumber,
  urlAttribute,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/updateProduct/{id}
 *
 * Laravel `ProductController::updateProduct` (`findOrFail` runs before the
 * validator, so a missing product yields the catch message).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const productId = /^-?\d+$/.test(id) ? Number(id) : null;
    const existing =
      productId === null
        ? null
        : await prisma.products.findUnique({ where: { id: productId } });
    if (!existing) {
      throw new Error("Product not found");
    }

    const body = await readCommerceBody(request);
    const fail = (message: string) =>
      NextResponse.json({ status: false, message });

    if (isBlank(body.category_id)) return fail(validationMsg.required("category_id"));
    if (!isInteger(body.category_id)) return fail(validationMsg.integer("category_id"));
    const categoryId = Number(body.category_id);
    if (!(await prisma.categories.findUnique({ where: { id: categoryId } }))) {
      return fail(validationMsg.exists("category_id"));
    }

    if (isBlank(body.user_id)) return fail(validationMsg.required("user_id"));
    if (!isInteger(body.user_id)) return fail(validationMsg.integer("user_id"));
    const userId = Number(body.user_id);
    if (!(await prisma.users.findUnique({ where: { id: userId } }))) {
      return fail(validationMsg.exists("user_id"));
    }

    if (isBlank(body.sub_category_id))
      return fail(validationMsg.required("sub_category_id"));
    if (!isInteger(body.sub_category_id))
      return fail(validationMsg.integer("sub_category_id"));
    const subCategoryId = Number(body.sub_category_id);
    if (
      !(await prisma.sub_categories.findUnique({ where: { id: subCategoryId } }))
    ) {
      return fail(validationMsg.exists("sub_category_id"));
    }

    if (isBlank(body.product_name)) return fail(validationMsg.required("product_name"));
    if (typeof body.product_name !== "string")
      return fail(validationMsg.string("product_name"));
    if (body.product_name.length > 255)
      return fail(validationMsg.maxChars("product_name", 255));

    if (isBlank(body.product_qty)) return fail(validationMsg.required("product_qty"));
    if (!isInteger(body.product_qty)) return fail(validationMsg.integer("product_qty"));
    if (toNumber(body.product_qty) < 1) return fail(validationMsg.minNumeric("product_qty", 1));

    if (isBlank(body.product_amount))
      return fail(validationMsg.required("product_amount"));
    if (!isNumericLaravel(body.product_amount))
      return fail(validationMsg.numeric("product_amount"));
    if (toNumber(body.product_amount) < 0)
      return fail(validationMsg.minNumeric("product_amount", 0));

    if (!isBlank(body.product_logo)) {
      if (!isImageFile(body.product_logo)) return fail(validationMsg.image("product_logo"));
      if (!hasMime(body.product_logo, ["jpg", "jpeg", "png", "gif"]))
        return fail(validationMsg.mimes("product_logo", "jpg,jpeg,png,gif"));
    }

    if (!isBlank(body.product_photo)) {
      if (!isImageFile(body.product_photo)) return fail(validationMsg.image("product_photo"));
      if (!hasMime(body.product_photo, ["jpg", "jpeg", "png", "gif"]))
        return fail(validationMsg.mimes("product_photo", "jpg,jpeg,png,gif"));
    }

    if (isBlank(body.product_url)) return fail(validationMsg.required("product_url"));
    if (!isValidUrl(body.product_url)) return fail(validationMsg.url("product_url"));

    if (!isBlank(body.is_delete) && !isBooleanLaravel(body.is_delete))
      return fail(validationMsg.boolean("is_delete"));

    let productLogo = existing.product_logo;
    let productPhoto = existing.product_photo;
    if (body.product_logo instanceof File) {
      productLogo = await storeFileToPublic(body.product_logo, "product_logos");
    }
    if (body.product_photo instanceof File) {
      productPhoto = await storeFileToPublic(body.product_photo, "product_photos");
    }

    const productQty = toNumber(body.product_qty);
    const updated = await prisma.products.update({
      where: { id: existing.id },
      data: {
        category_id: categoryId,
        user_id: userId,
        sub_category_id: subCategoryId,
        product_name: body.product_name,
        product_qty: productQty,
        stock: String(productQty),
        product_amount: String(body.product_amount),
        product_logo: productLogo,
        product_photo: productPhoto,
        product_url: String(body.product_url),
        is_delete:
          body.is_delete === undefined || body.is_delete === null
            ? existing.is_delete
            : laravelTinyintBool(body.is_delete),
      },
    });

    const data = serializeCommerce(updated) as Record<string, unknown>;
    data.product_logo = urlAttribute(request, updated.product_logo);
    data.product_photo = urlAttribute(request, updated.product_photo);

    return NextResponse.json({
      status: true,
      message: "Product updated successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to update product.",
    });
  }
}
