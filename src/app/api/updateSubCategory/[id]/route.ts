import { NextResponse } from "next/server";

import {
  isBlank,
  readCommerceBody,
  serializeCommerce,
  storeFileToPublic,
  tinyintAsInt,
  urlAttribute,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/updateSubCategory/{id}
 *
 * Laravel `SubCategoryController::updateSubCategory`.
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
    const body = await readCommerceBody(request);

    if (isBlank(body.category_id)) {
      return NextResponse.json({
        status: false,
        message: validationMsg.required("category_id"),
      });
    }
    const categoryId = /^-?\d+$/.test(String(body.category_id))
      ? Number(body.category_id)
      : null;
    const category =
      categoryId === null
        ? null
        : await prisma.categories.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({
        status: false,
        message: validationMsg.exists("category_id"),
      });
    }

    if (isBlank(body.sub_category_name)) {
      return NextResponse.json({
        status: false,
        message: validationMsg.required("sub_category_name"),
      });
    }
    if (typeof body.sub_category_name !== "string") {
      return NextResponse.json({
        status: false,
        message: validationMsg.string("sub_category_name"),
      });
    }
    if (body.sub_category_name.length > 255) {
      return NextResponse.json({
        status: false,
        message: validationMsg.maxChars("sub_category_name", 255),
      });
    }

    const { id } = await params;
    const subCategoryId = /^-?\d+$/.test(id) ? Number(id) : null;
    const subCategory =
      subCategoryId === null
        ? null
        : await prisma.sub_categories.findUnique({
            where: { id: subCategoryId },
          });
    if (!subCategory) {
      return NextResponse.json({
        status: false,
        message: "SubCategory not found.",
      });
    }

    let subCategoryLogo = subCategory.sub_category_logo;
    let subCategoryPhoto = subCategory.sub_category_photo;

    if (body.sub_category_logo instanceof File) {
      subCategoryLogo = await storeFileToPublic(
        body.sub_category_logo,
        "sub_category_logos",
      );
    }
    if (body.sub_category_photo instanceof File) {
      subCategoryPhoto = await storeFileToPublic(
        body.sub_category_photo,
        "sub_category_photos",
      );
    }

    const updated = await prisma.sub_categories.update({
      where: { id: subCategory.id },
      data: {
        category_id: category.id,
        sub_category_name: body.sub_category_name,
        sub_category_logo: subCategoryLogo,
        sub_category_photo: subCategoryPhoto,
        ...("sub_category_url" in body
          ? {
              sub_category_url:
                typeof body.sub_category_url === "string"
                  ? body.sub_category_url
                  : null,
            }
          : {}),
      },
    });

    const data = serializeCommerce(updated) as Record<string, unknown>;
    data.is_deleted = tinyintAsInt(updated.is_deleted);
    data.sub_category_logo = urlAttribute(request, updated.sub_category_logo);
    data.sub_category_photo = urlAttribute(request, updated.sub_category_photo);

    return NextResponse.json({
      status: true,
      message: "SubCategory updated successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to update subcategory.",
    });
  }
}
