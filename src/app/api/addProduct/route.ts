import { NextResponse } from "next/server";

import {
  hasMime,
  isBlank,
  isImageFile,
  isInteger,
  isNumericLaravel,
  isValidUrl,
  laravelTinyintBool,
  readCommerceBody,
  storeFileToPublic,
  toNumber,
  urlAttribute,
  validationMsg,
} from "@/lib/api-commerce";
import { laravelDate } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/addProduct
 *
 * Laravel `ProductController::addProduct`. The validator reports the first
 * failing rule in declaration order, so checks are interleaved per field.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
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

    if (isBlank(body.product_logo)) return fail(validationMsg.required("product_logo"));
    if (!isImageFile(body.product_logo)) return fail(validationMsg.image("product_logo"));
    if (!hasMime(body.product_logo, ["jpg", "jpeg", "png", "gif"]))
      return fail(validationMsg.mimes("product_logo", "jpg,jpeg,png,gif"));

    if (isBlank(body.product_photo)) return fail(validationMsg.required("product_photo"));
    if (!isImageFile(body.product_photo)) return fail(validationMsg.image("product_photo"));
    if (!hasMime(body.product_photo, ["jpg", "jpeg", "png", "gif"]))
      return fail(validationMsg.mimes("product_photo", "jpg,jpeg,png,gif"));

    if (isBlank(body.product_url)) return fail(validationMsg.required("product_url"));
    if (!isValidUrl(body.product_url)) return fail(validationMsg.url("product_url"));

    const productLogo = await storeFileToPublic(
      body.product_logo as File,
      "product_logos",
    );
    const productPhoto = await storeFileToPublic(
      body.product_photo as File,
      "product_photos",
    );
    const productQty = toNumber(body.product_qty);

    const product = await prisma.products.create({
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
            ? false
            : laravelTinyintBool(body.is_delete),
      },
    });

    return NextResponse.json({
      status: true,
      message: "Product added successfully.",
      data: {
        category_id: product.category_id,
        user_id: product.user_id,
        sub_category_id: product.sub_category_id,
        product_name: product.product_name,
        product_qty: product.product_qty,
        stock: product.stock,
        product_amount: product.product_amount.toFixed(2),
        product_logo: urlAttribute(request, product.product_logo),
        product_photo: urlAttribute(request, product.product_photo),
        product_url: product.product_url,
        is_delete: product.is_delete,
        created_at: laravelDate(product.created_at),
        updated_at: laravelDate(product.updated_at),
        id: product.id,
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to add product.",
    });
  }
}
