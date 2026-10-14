import { NextResponse } from "next/server";

import {
  isBlank,
  isInteger,
  readCommerceBody,
  serializeCommerce,
  toNumber,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * POST /api/ProductReturn
 *
 * Laravel `OrderController::returnProduct`. The returned stock is added back
 * with PHP's `+=`, so `updated_product_stock` is emitted as a number rather
 * than the varchar the column stores.
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

    if (isBlank(body.product_id)) return fail(validationMsg.required("product_id"));
    const productId = /^-?\d+$/.test(String(body.product_id))
      ? Number(body.product_id)
      : null;
    const product =
      productId === null
        ? null
        : await prisma.products.findUnique({ where: { id: productId } });
    if (!product) {
      return fail(validationMsg.exists("product_id"));
    }

    if (isBlank(body.product_qty)) return fail(validationMsg.required("product_qty"));
    if (!isInteger(body.product_qty)) return fail(validationMsg.integer("product_qty"));
    if (toNumber(body.product_qty) < 1)
      return fail(validationMsg.minNumeric("product_qty", 1));

    if (isBlank(body.return_reason)) return fail(validationMsg.required("return_reason"));
    if (typeof body.return_reason !== "string")
      return fail(validationMsg.string("return_reason"));
    if (body.return_reason.length > 255)
      return fail(validationMsg.maxChars("return_reason", 255));

    const quantity = toNumber(body.product_qty);
    const updatedStock = Number(product.stock) + quantity;

    const result = await prisma.$transaction(async (tx) => {
      const productReturn = await tx.product_returns.create({
        data: {
          customer_id: customerId,
          product_id: product.id,
          product_name: product.product_name,
          product_qty: quantity,
          return_reason: body.return_reason as string,
        },
      });

      await tx.products.update({
        where: { id: product.id },
        data: { stock: String(updatedStock) },
      });

      return productReturn;
    });

    return NextResponse.json({
      status: true,
      message: "Product return processed successfully!",
      product_return: serializeCommerce(result),
      updated_product_stock: updatedStock,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message:
        "An error occurred while processing the return. Please try again later.",
    });
  }
}
