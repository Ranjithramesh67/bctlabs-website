import { NextResponse } from "next/server";

import {
  isBlank,
  isInteger,
  isNumericLaravel,
  readCommerceBody,
  toNumber,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/createOrder
 *
 * Laravel `OrderController::createOrder`. The transaction row is inserted
 * without an `amount`; the legacy connection runs with `strict => false`, so
 * MySQL fills the NOT NULL column with its implicit `0.00` default (visible in
 * the pre-existing `transactions` row). We pass `0` explicitly to reproduce it.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await readCommerceBody(request);
    const fail = (message: string) =>
      NextResponse.json({ status: false, message });

    if (isBlank(body.customer_id)) return fail(validationMsg.required("customer_id"));
    const customerId = /^-?\d+$/.test(String(body.customer_id))
      ? Number(body.customer_id)
      : null;
    if (
      customerId === null ||
      !(await prisma.customers.findUnique({ where: { id: customerId } }))
    ) {
      return fail(validationMsg.exists("customer_id"));
    }

    if (isBlank(body.order_items)) return fail(validationMsg.required("order_items"));
    if (!Array.isArray(body.order_items)) return fail(validationMsg.array("order_items"));
    const items = body.order_items as Array<Record<string, unknown>>;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index] ?? {};

      const productAttr = `order_items.${index}.product_id`;
      if (isBlank(item.product_id)) return fail(validationMsg.required(productAttr));
      const productId = /^-?\d+$/.test(String(item.product_id))
        ? Number(item.product_id)
        : null;
      if (
        productId === null ||
        !(await prisma.products.findUnique({ where: { id: productId } }))
      ) {
        return fail(validationMsg.exists(productAttr));
      }

      const categoryAttr = `order_items.${index}.category_id`;
      if (isBlank(item.category_id)) return fail(validationMsg.required(categoryAttr));
      const itemCategoryId = /^-?\d+$/.test(String(item.category_id))
        ? Number(item.category_id)
        : null;
      if (
        itemCategoryId === null ||
        !(await prisma.categories.findUnique({ where: { id: itemCategoryId } }))
      ) {
        return fail(validationMsg.exists(categoryAttr));
      }

      const subCategoryAttr = `order_items.${index}.sub_category_id`;
      if (isBlank(item.sub_category_id))
        return fail(validationMsg.required(subCategoryAttr));
      const itemSubCategoryId = /^-?\d+$/.test(String(item.sub_category_id))
        ? Number(item.sub_category_id)
        : null;
      if (
        itemSubCategoryId === null ||
        !(await prisma.sub_categories.findUnique({
          where: { id: itemSubCategoryId },
        }))
      ) {
        return fail(validationMsg.exists(subCategoryAttr));
      }

      const quantityAttr = `order_items.${index}.quantity`;
      if (isBlank(item.quantity)) return fail(validationMsg.required(quantityAttr));
      if (!isInteger(item.quantity)) return fail(validationMsg.integer(quantityAttr));
      if (toNumber(item.quantity) < 1)
        return fail(validationMsg.minNumeric(quantityAttr, 1));

      const priceAttr = `order_items.${index}.price_per_unit`;
      if (isBlank(item.price_per_unit)) return fail(validationMsg.required(priceAttr));
      if (!isNumericLaravel(item.price_per_unit))
        return fail(validationMsg.numeric(priceAttr));
      if (toNumber(item.price_per_unit) < 0.01)
        return fail(validationMsg.minNumeric(priceAttr, 0.01));
    }

    if (isBlank(body.paid_amount)) return fail(validationMsg.required("paid_amount"));
    if (!isNumericLaravel(body.paid_amount))
      return fail(validationMsg.numeric("paid_amount"));
    if (toNumber(body.paid_amount) < 0)
      return fail(validationMsg.minNumeric("paid_amount", 0));

    for (const item of items) {
      const product = await prisma.products.findUnique({
        where: { id: Number(item.product_id) },
      });
      if (product && Number(product.stock) < Number(item.quantity)) {
        return fail(
          `Insufficient stock for product . Only ${product.stock} units available.`,
        );
      }
    }

    const paidAmount = toNumber(body.paid_amount);
    const result = await prisma.$transaction(async (tx) => {
      const subtotal = items.reduce(
        (sum, item) =>
          sum + Number(item.quantity) * Number(item.price_per_unit),
        0,
      );

      const previousOrder = await tx.orders.findFirst({
        where: { customer_id: customerId },
        orderBy: { created_at: "desc" },
      });
      const previousBalance = previousOrder
        ? Number(previousOrder.current_day_balance)
        : 0;
      const currentDayBalance = previousBalance + subtotal - paidAmount;

      const order = await tx.orders.create({
        data: {
          user_id: auth.user.id,
          customer_id: customerId,
          previous_balance: previousBalance,
          subtotal,
          paid_amount: paidAmount,
          current_day_balance: currentDayBalance,
          remaining_balance: currentDayBalance,
        },
      });

      await tx.transactions.create({
        data: {
          user_id: BigInt(auth.user.id),
          customer_id: customerId,
          amount: 0,
          type: "debit",
          reference: `Order ID: ${order.id}`,
          balance_after: currentDayBalance,
          status: "completed",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      for (const item of items) {
        await tx.order_items.create({
          data: {
            order_id: order.id,
            product_id: Number(item.product_id),
            category_id: Number(item.category_id),
            sub_category_id: Number(item.sub_category_id),
            quantity: Number(item.quantity),
            price_per_unit: String(item.price_per_unit),
            total_price: String(
              Number(item.quantity) * Number(item.price_per_unit),
            ),
          },
        });

        const product = await tx.products.findUnique({
          where: { id: Number(item.product_id) },
        });
        if (product) {
          await tx.products.update({
            where: { id: product.id },
            data: { stock: String(Number(product.stock) - Number(item.quantity)) },
          });
        }
      }

      return { subtotal, currentDayBalance };
    });

    return NextResponse.json({
      status: true,
      message: "Order created successfully.",
      data: {
        customer_id: body.customer_id,
        order_items: body.order_items,
        total_price: result.subtotal,
        paid_amount: body.paid_amount,
        remaining_balance: result.currentDayBalance,
      },
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to create order.",
    });
  }
}
