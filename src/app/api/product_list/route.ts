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
 * ANY /api/product_list
 *
 * Laravel `ProductController::product_list`.
 */
async function productList(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const input = await readCommerceInput(request);
    const where: Record<string, unknown> = { is_delete: false };

    if (isFilled(input.category_id)) {
      where.category_id = /^-?\d+$/.test(String(input.category_id))
        ? Number(input.category_id)
        : -1;
    }
    if (isFilled(input.sub_category_id)) {
      where.sub_category_id = /^-?\d+$/.test(String(input.sub_category_id))
        ? Number(input.sub_category_id)
        : -1;
    }
    if (isFilled(input.product_name)) {
      where.product_name = { contains: String(input.product_name) };
    }

    const products = await prisma.products.findMany({
      where,
      orderBy: { id: "asc" },
    });

    const data = products.map((product) => {
      const item = serializeCommerce(product) as Record<string, unknown>;
      item.product_logo_url = laravelUrl(request, product.product_logo);
      item.product_photo_url = laravelUrl(request, product.product_photo);
      return item;
    });

    return NextResponse.json({
      status: true,
      message: "Products fetched successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch products.",
    });
  }
}

export const GET = productList;
export const POST = productList;
export const PUT = productList;
export const PATCH = productList;
export const DELETE = productList;
