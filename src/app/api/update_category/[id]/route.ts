import { NextResponse } from "next/server";

import {
  isBlank,
  readCommerceBody,
  serializeCommerce,
  storeFileToPublic,
  urlAttribute,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/update_category/{id}
 *
 * Laravel `CategoryController::updateCategory` (`Category::findOrFail` runs
 * before validation, so a missing row short-circuits to the catch message).
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
    const categoryId = /^-?\d+$/.test(id) ? Number(id) : null;
    const category =
      categoryId === null
        ? null
        : await prisma.categories.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new Error("Category not found");
    }

    const body = await readCommerceBody(request);

    if (isBlank(body.category_name)) {
      return NextResponse.json({
        status: false,
        message: validationMsg.required("category_name"),
      });
    }
    if (typeof body.category_name !== "string") {
      return NextResponse.json({
        status: false,
        message: validationMsg.string("category_name"),
      });
    }
    if (body.category_name.length > 255) {
      return NextResponse.json({
        status: false,
        message: validationMsg.maxChars("category_name", 255),
      });
    }

    let categoryLogo = category.category_logo;
    let categoryPhoto = category.category_photo;

    if (body.category_logo instanceof File) {
      categoryLogo = await storeFileToPublic(body.category_logo, "category_logos");
    }
    if (body.category_photo instanceof File) {
      categoryPhoto = await storeFileToPublic(
        body.category_photo,
        "category_photos",
      );
    }

    const updated = await prisma.categories.update({
      where: { id: category.id },
      data: {
        category_name: body.category_name,
        category_logo: categoryLogo,
        category_photo: categoryPhoto,
        ...("category_url" in body
          ? {
              category_url:
                typeof body.category_url === "string" ? body.category_url : null,
            }
          : {}),
      },
    });

    const data = serializeCommerce(updated) as Record<string, unknown>;
    data.category_logo = urlAttribute(request, updated.category_logo);
    data.category_photo = urlAttribute(request, updated.category_photo);

    return NextResponse.json({
      status: true,
      message: "Category updated successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to update category.",
    });
  }
}
