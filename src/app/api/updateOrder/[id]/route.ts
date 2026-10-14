import { NextResponse } from "next/server";

import {
  isBlank,
  isInteger,
  isNumericLaravel,
  readCommerceBody,
  serializeCommerce,
  toNumber,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/updateOrder/{id}
 *
 * Laravel `OrderController::updateOrder`. Only `subtotal`, `paid_amount` and
 * `remaining_balance` are touched; `previous_balance` / `current_day_balance`
 * are left untouched by the original.
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
    const orderId = /^-?\d+$/.test(id) ? Number(id) : null;
    const body = await readCommerceBody(request);
    const fail = (message: string) =>
      NextResponse.json({ status: false, message });

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

    if (isFilledPaidAmount(body.paid_amount)) {
      if (!isNumericLaravel(body.paid_amount))
        return fail(validationMsg.numeric("paid_amount"));
      if (toNumber(body.paid_amount) < 0)
        return fail(validationMsg.minNumeric("paid_amount", 0));
    }

    const order =
      orderId === null
        ? null
        : await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) {
      return fail("Order not found.");
    }

    const existingItems = await prisma.order_items.findMany({
      where: { order_id: order.id },
    });

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

    const requestedPaid = isFilledPaidAmount(body.paid_amount)
      ? toNumber(body.paid_amount)
      : Number(order.paid_amount);

    const result = await prisma.$transaction(async (tx) => {
      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.price_per_unit),
        0,
      );
      const remainingBalance = subtotal - requestedPaid;

      await tx.orders.update({
        where: { id: order.id },
        data: {
          subtotal,
          paid_amount: requestedPaid,
          remaining_balance: remainingBalance,
        },
      });

      if (isFilledPaidAmount(body.paid_amount) && requestedPaid > 0) {
        await tx.transactions.create({
          data: {
            user_id: BigInt(auth.user.id),
            customer_id: order.customer_id,
            amount: requestedPaid,
            type: "debit",
            reference: `Order ID: ${order.id}`,
            balance_after: remainingBalance,
            status: "completed",
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      for (const item of items) {
        const existing = existingItems.find(
          (row) => row.product_id === Number(item.product_id),
        );
        const totalPrice = Number(item.quantity) * Number(item.price_per_unit);
        if (existing) {
          await tx.order_items.update({
            where: { id: existing.id },
            data: {
              quantity: Number(item.quantity),
              price_per_unit: String(item.price_per_unit),
              total_price: String(totalPrice),
            },
          });
        } else {
          await tx.order_items.create({
            data: {
              order_id: order.id,
              product_id: Number(item.product_id),
              category_id: Number(item.category_id),
              sub_category_id: Number(item.sub_category_id),
              quantity: Number(item.quantity),
              price_per_unit: String(item.price_per_unit),
              total_price: String(totalPrice),
            },
          });
        }

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

      return subtotal;
    });

    return NextResponse.json({
      status: true,
      message: "Order updated successfully.",
      data: serializeCommerce({
        customer_id: order.customer_id,
        order_items: body.order_items,
        total_price: result,
        paid_amount: isFilledPaidAmount(body.paid_amount)
          ? body.paid_amount
          : order.paid_amount,
        remaining_balance: result - requestedPaid,
      }),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to update order.",
    });
  }
}

/**
 * The `paid_amount` rule is `nullable`, so only a present non-null value is
 * validated; an explicit `null` behaves like omission.
 */
function isFilledPaidAmount(value: unknown): boolean {
  return value !== undefined && value !== null;
}
