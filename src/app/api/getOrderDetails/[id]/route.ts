import { NextResponse } from "next/server";

import { laravelUrl } from "@/lib/api-format";
import { serializeCommerce, tinyintAsInt } from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/getOrderDetails/{id}
 *
 * Laravel `OrderController::getOrderDetails`. Note the top-level payload has no
 * `remaining_balance` field, and the product / customer photo URLs are built by
 * raw string concatenation (so a `null` photo yields the bare base URL + "/").
 */
export async function GET(
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
    const order =
      orderId === null
        ? null
        : await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({
        status: false,
        message: "Order not found.",
      });
    }

    const items = await prisma.order_items.findMany({
      where: { order_id: order.id },
      orderBy: { id: "asc" },
    });
    const productIds = [...new Set(items.map((item) => item.product_id))];
    const categoryIds = [...new Set(items.map((item) => item.category_id))];
    const subCategoryIds = [...new Set(items.map((item) => item.sub_category_id))];

    const products = productIds.length
      ? await prisma.products.findMany({ where: { id: { in: productIds } } })
      : [];
    const categories = categoryIds.length
      ? await prisma.categories.findMany({ where: { id: { in: categoryIds } } })
      : [];
    const subCategories = subCategoryIds.length
      ? await prisma.sub_categories.findMany({
          where: { id: { in: subCategoryIds } },
        })
      : [];
    const customer = await prisma.customers.findUnique({
      where: { id: order.customer_id },
    });

    const productById = new Map(products.map((product) => [product.id, product]));
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const subCategoryById = new Map(
      subCategories.map((subCategory) => [subCategory.id, subCategory]),
    );

    const orderItems = items.map((item) => {
      const product = productById.get(item.product_id);
      const category = categoryById.get(item.category_id);
      const subCategory = subCategoryById.get(item.sub_category_id);

      return {
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        category_id: item.category_id,
        sub_category_id: item.sub_category_id,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        total_price: item.total_price,
        created_at: item.created_at,
        updated_at: item.updated_at,
        product: {
          id: product?.id,
          product_name: product?.product_name,
          product_qty: product?.product_qty,
          product_amount: product?.product_amount,
          product_logo: laravelUrl(request, product?.product_logo),
          product_photo: laravelUrl(request, product?.product_photo),
          product_url: product?.product_url,
          is_delete: product?.is_delete,
          created_at: product?.created_at,
          updated_at: product?.updated_at,
        },
        category: {
          id: category?.id,
          category_name: category?.category_name,
          category_logo: category?.category_logo
            ? laravelUrl(request, category.category_logo)
            : null,
          category_photo: category?.category_photo
            ? laravelUrl(request, category.category_photo)
            : null,
          category_url: category?.category_url,
          is_deleted: category?.is_deleted,
          created_at: category?.created_at,
          updated_at: category?.updated_at,
        },
        sub_category: {
          id: subCategory?.id,
          sub_category_name: subCategory?.sub_category_name,
          sub_category_logo: subCategory?.sub_category_logo
            ? laravelUrl(request, subCategory.sub_category_logo)
            : null,
          sub_category_photo: subCategory?.sub_category_photo
            ? laravelUrl(request, subCategory.sub_category_photo)
            : null,
          sub_category_url: subCategory?.sub_category_url,
          is_deleted: tinyintAsInt(subCategory?.is_deleted ?? null),
          created_at: subCategory?.created_at,
          updated_at: subCategory?.updated_at,
        },
      };
    });

    const data = {
      id: order.id,
      user_id: order.user_id,
      customer_id: order.customer_id,
      previous_balance: order.previous_balance,
      subtotal: order.subtotal,
      paid_amount: order.paid_amount,
      current_day_balance: order.current_day_balance,
      is_deleted: order.is_deleted,
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_items: orderItems,
      customer: {
        id: customer?.id,
        username: customer?.username,
        userbusiness_name: customer?.userbusiness_name,
        mobile_number: customer?.mobile_number,
        address: customer?.address,
        userphoto: laravelUrl(request, customer?.userphoto),
        userbusiness_photo: laravelUrl(request, customer?.userbusiness_photo),
        phone: customer?.phone,
        currency: customer?.currency,
        default_language: customer?.default_language,
        created_at: customer?.created_at,
        updated_at: customer?.updated_at,
      },
    };

    return NextResponse.json({
      status: true,
      message: "Order details retrieved successfully.",
      data: serializeCommerce(data),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to retrieve order details.",
    });
  }
}
