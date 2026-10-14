import { NextResponse } from "next/server";

import {
  isFilled,
  readCommerceInput,
  serializeCommerce,
} from "@/lib/api-commerce";
import { laravelUrl } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * ANY /api/categories_list
 *
 * Laravel `CategoryController::getCategoryList`. The per-row `subtitle` counts
 * tickets from the `Concert`/`Sport`/`Movie`/`Music` models; those models (and
 * their tables) are absent from the legacy schema, so the count remains 0 which
 * is what the "empty" branches of those `if` statements produce.
 */
async function getCategoryList(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const input = await readCommerceInput(request);
    const where: Record<string, unknown> = { is_deleted: 0 };

    if (isFilled(input.category_name)) {
      where.category_name = { contains: String(input.category_name) };
    }

    if (isFilled(input.created_at)) {
      const start = new Date(`${String(input.created_at)}T00:00:00.000Z`);
      if (Number.isNaN(start.getTime())) {
        return NextResponse.json({
          status: true,
          message: "Categories fetched successfully.",
          data: [],
        });
      }
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      where.created_at = { gte: start, lt: end };
    }

    const categories = await prisma.categories.findMany({
      where,
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
      item.subtitle = `${0}  Concert Tickets Available`;
      return item;
    });

    return NextResponse.json({
      status: true,
      message: "Categories fetched successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch categories.",
    });
  }
}

export const GET = getCategoryList;
export const POST = getCategoryList;
export const PUT = getCategoryList;
export const PATCH = getCategoryList;
export const DELETE = getCategoryList;
