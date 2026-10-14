import { NextResponse } from "next/server";

import {
  isFilled,
  readCommerceInput,
  serializeCommerce,
  tinyintAsInt,
  urlAttribute,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * ANY /api/getSubCategoryList
 *
 * Laravel `SubCategoryController::getSubCategoryList`.
 */
async function getSubCategoryList(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const input = await readCommerceInput(request);
    const where: Record<string, unknown> = { is_deleted: false };

    if (isFilled(input.category_id)) {
      where.category_id = /^-?\d+$/.test(String(input.category_id))
        ? Number(input.category_id)
        : -1;
    }
    if (isFilled(input.sub_category_name)) {
      where.sub_category_name = { contains: String(input.sub_category_name) };
    }

    const subCategories = await prisma.sub_categories.findMany({
      where,
      orderBy: { id: "asc" },
    });

    const data = subCategories.map((subCategory) => {
      const item = serializeCommerce(subCategory) as Record<string, unknown>;
      item.is_deleted = tinyintAsInt(subCategory.is_deleted);
      item.sub_category_logo = urlAttribute(request, subCategory.sub_category_logo);
      item.sub_category_photo = urlAttribute(
        request,
        subCategory.sub_category_photo,
      );
      return item;
    });

    return NextResponse.json({
      status: true,
      message: "SubCategories fetched successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch subcategories.",
    });
  }
}

export const GET = getSubCategoryList;
export const POST = getSubCategoryList;
export const PUT = getSubCategoryList;
export const PATCH = getSubCategoryList;
export const DELETE = getSubCategoryList;
