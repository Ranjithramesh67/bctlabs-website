import { NextResponse } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import {
  isFilled,
  isValidDate,
  laravelAttr,
  phpStringGreaterThan,
  readCommerceInput,
  serializeCommerce,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * ANY /api/getStockDetails
 *
 * Laravel `OrderController::getStockDetails`. `stock` is a varchar column that
 * the controller partitions through a Collection, so the loose PHP comparison
 * is reproduced.
 */
async function getStockDetails(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const input = await readCommerceInput(request);
    const fail = (message: string) =>
      NextResponse.json({ status: false, message });

    const fromFilled = isFilled(input.from_date);
    const toFilled = isFilled(input.to_date);

    if (fromFilled && !isValidDate(input.from_date)) {
      return fail(validationMsg.date("from_date"));
    }
    if (toFilled) {
      if (!isValidDate(input.to_date)) {
        return fail(validationMsg.date("to_date"));
      }
      if (
        !fromFilled ||
        !isValidDate(input.from_date) ||
        Date.parse(String(input.to_date)) < Date.parse(String(input.from_date))
      ) {
        return fail(
          validationMsg.afterOrEqual("to_date", laravelAttr("from_date")),
        );
      }
    }

    const where: Prisma.productsWhereInput = {};
    if (fromFilled) {
      where.updated_at = { gte: new Date(String(input.from_date)) };
    }
    if (toFilled) {
      where.updated_at = {
        ...(where.updated_at as Prisma.DateTimeFilter | undefined),
        lte: new Date(String(input.to_date)),
      };
    }

    const stockDetails = await prisma.products.findMany({
      where,
      orderBy: { updated_at: "desc" },
      select: { id: true, product_name: true, stock: true, updated_at: true },
    });

    const inStock: unknown[] = [];
    const outOfStock: unknown[] = [];
    for (const product of stockDetails) {
      if (phpStringGreaterThan(product.stock, 0)) {
        inStock.push(product);
      } else {
        outOfStock.push(product);
      }
    }

    return NextResponse.json({
      status: true,
      message: "Stock details retrieved successfully.",
      data: {
        in_stock: serializeCommerce(inStock),
        out_of_stock: serializeCommerce(outOfStock),
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch stock details.",
    });
  }
}

export const GET = getStockDetails;
export const POST = getStockDetails;
export const PUT = getStockDetails;
export const PATCH = getStockDetails;
export const DELETE = getStockDetails;
