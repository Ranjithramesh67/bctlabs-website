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
 * POST /api/add_category
 *
 * Laravel `CategoryController::addCategory`.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
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

    const categoryLogo =
      body.category_logo instanceof File
        ? await storeFileToPublic(body.category_logo, "category_logos")
        : null;
    const categoryPhoto =
      body.category_photo instanceof File
        ? await storeFileToPublic(body.category_photo, "category_photos")
        : null;

    const categoryUrl =
      typeof body.category_url === "string" ? body.category_url : null;

    const category = await prisma.categories.create({
      data: {
        category_name: body.category_name,
        category_logo: categoryLogo,
        category_photo: categoryPhoto,
        category_url: categoryUrl,
      },
    });

    return NextResponse.json({
      status: true,
      message: "Category added successfully.",
      data: {
        category_name: category.category_name,
        category_logo: urlAttribute(request, category.category_logo),
        category_photo: urlAttribute(request, category.category_photo),
        category_url: category.category_url,
        created_at: laravelDate(category.created_at),
        updated_at: laravelDate(category.updated_at),
        id: category.id,
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to add category.",
    });
  }
}
