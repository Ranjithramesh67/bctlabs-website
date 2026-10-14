import { NextResponse } from "next/server";

import {
  isBlank,
  readCommerceBody,
  storeFileToPublic,
  urlAttribute,
  validationMsg,
} from "@/lib/api-commerce";
import { laravelDate } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/addSubCategory
 *
 * Laravel `SubCategoryController::addSubCategory`.
 */
export async function POST(request: Request) {
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

    const subCategoryLogo =
      body.sub_category_logo instanceof File
        ? await storeFileToPublic(body.sub_category_logo, "sub_category_logos")
        : null;
    const subCategoryPhoto =
      body.sub_category_photo instanceof File
        ? await storeFileToPublic(body.sub_category_photo, "sub_category_photos")
        : null;
    const subCategoryUrl =
      typeof body.sub_category_url === "string" ? body.sub_category_url : null;

    const subCategory = await prisma.sub_categories.create({
      data: {
        category_id: category.id,
        sub_category_name: body.sub_category_name,
        sub_category_logo: subCategoryLogo,
        sub_category_photo: subCategoryPhoto,
        sub_category_url: subCategoryUrl,
      },
    });

    return NextResponse.json({
      status: true,
      message: "SubCategory added successfully.",
      data: {
        category_id: subCategory.category_id,
        sub_category_name: subCategory.sub_category_name,
        sub_category_logo: urlAttribute(request, subCategory.sub_category_logo),
        sub_category_photo: urlAttribute(request, subCategory.sub_category_photo),
        sub_category_url: subCategory.sub_category_url,
        created_at: laravelDate(subCategory.created_at),
        updated_at: laravelDate(subCategory.updated_at),
        id: subCategory.id,
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to add subcategory.",
    });
  }
}
