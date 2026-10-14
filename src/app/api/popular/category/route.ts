import { NextResponse } from "next/server";

import { serializeCommerce } from "@/lib/api-commerce";
import { laravelUrl } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/popular/category
 *
 * Laravel `CategoryController::getPopularCategoryList` (registered twice in
 * `routes/api.php`, so this module exports `GET` once).
 */
export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const categories = await prisma.categories.findMany({
      where: { is_deleted: 0, is_popular: 1 },
      orderBy: { id: "asc" },
    });

    const data = categories.map((category) => {
      const item = serializeCommerce(category) as Record<string, unknown>;
      item.category_logo = category.category_logo
        ? laravelUrl(request, category.category_logo)
        : "";
      item.category_photo = category.category_photo
        ? laravelUrl(request, category.category_photo)
        : "";
      return item;
    });

    return NextResponse.json({
      status: true,
      message: "Popular Categories fetched successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch categories.",
    });
  }
}
