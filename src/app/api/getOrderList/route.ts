import { NextResponse } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import {
  isFilled,
  isValidDate,
  laravelAttr,
  readCommerceInput,
  serializeCommerce,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * ANY /api/getOrderList
 *
 * Laravel `OrderController::getOrderList`. The `before_or_equal:end_date` /
 * `after_or_equal:start_date` rules compare against the *other* parameter, so a
 * lone `start_date` (without `end_date`) actually fails validation.
 */
async function getOrderList(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const input = await readCommerceInput(request);
    const fail = (message: string) =>
      NextResponse.json({ status: false, message });

    const startFilled = isFilled(input.start_date);
    const endFilled = isFilled(input.end_date);

    if (startFilled) {
      if (!isValidDate(input.start_date)) return fail(validationMsg.date("start_date"));
      if (
        !endFilled ||
        !isValidDate(input.end_date) ||
        Date.parse(String(input.start_date)) > Date.parse(String(input.end_date))
      ) {
        return fail(
          validationMsg.beforeOrEqual("start_date", laravelAttr("end_date")),
        );
      }
    }
    if (endFilled) {
      if (!isValidDate(input.end_date)) return fail(validationMsg.date("end_date"));
      if (
        !startFilled ||
        !isValidDate(input.start_date) ||
        Date.parse(String(input.end_date)) < Date.parse(String(input.start_date))
      ) {
        return fail(
          validationMsg.afterOrEqual("end_date", laravelAttr("start_date")),
        );
      }
    }

    if (isFilled(input.product_id)) {
      const productId = /^-?\d+$/.test(String(input.product_id))
        ? Number(input.product_id)
        : null;
      if (
        productId === null ||
        !(await prisma.products.findUnique({ where: { id: productId } }))
      ) {
        return fail(validationMsg.exists("product_id"));
      }
    }
    if (isFilled(input.category_id)) {
      const categoryId = /^-?\d+$/.test(String(input.category_id))
        ? Number(input.category_id)
        : null;
      if (
        categoryId === null ||
        !(await prisma.categories.findUnique({ where: { id: categoryId } }))
      ) {
        return fail(validationMsg.exists("category_id"));
      }
    }
    if (isFilled(input.sub_category_id)) {
      const subCategoryId = /^-?\d+$/.test(String(input.sub_category_id))
        ? Number(input.sub_category_id)
        : null;
      if (
        subCategoryId === null ||
        !(await prisma.sub_categories.findUnique({ where: { id: subCategoryId } }))
      ) {
        return fail(validationMsg.exists("sub_category_id"));
      }
    }

    const where: Prisma.ordersWhereInput = {};
    if (startFilled && endFilled) {
      where.created_at = {
        gte: new Date(String(input.start_date)),
        lte: new Date(String(input.end_date)),
      };
    }
    const itemFilter: Prisma.order_itemsWhereInput = {};
    if (isFilled(input.product_id)) itemFilter.product_id = Number(input.product_id);
    if (isFilled(input.category_id)) itemFilter.category_id = Number(input.category_id);
    if (isFilled(input.sub_category_id))
      itemFilter.sub_category_id = Number(input.sub_category_id);
    if (Object.keys(itemFilter).length > 0) {
      const matchingItems = await prisma.order_items.findMany({
        where: itemFilter,
        select: { order_id: true },
      });
      where.id = { in: [...new Set(matchingItems.map((item) => item.order_id))] };
    }

    const orders = await prisma.orders.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const orderIds = orders.map((order) => order.id);
    const items = orderIds.length
      ? await prisma.order_items.findMany({
          where: { order_id: { in: orderIds } },
          orderBy: { id: "asc" },
        })
      : [];
    const itemsByOrder = new Map<number, typeof items>();
    for (const item of items) {
      const bucket = itemsByOrder.get(item.order_id) ?? [];
      bucket.push(item);
      itemsByOrder.set(item.order_id, bucket);
    }

    const data = orders.map((order) => {
      const record = serializeCommerce(order) as Record<string, unknown>;
      record.order_items = serializeCommerce(itemsByOrder.get(order.id) ?? []);
      return record;
    });

    return NextResponse.json({
      status: true,
      message: "Order list retrieved successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to retrieve orders.",
    });
  }
}

export const GET = getOrderList;
export const POST = getOrderList;
export const PUT = getOrderList;
export const PATCH = getOrderList;
export const DELETE = getOrderList;
