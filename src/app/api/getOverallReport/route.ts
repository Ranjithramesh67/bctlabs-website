import { NextResponse } from "next/server";

import { laravelUrl } from "@/lib/api-format";
import { readCommerceInput, serializeCommerce } from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * ANY /api/getOverallReport
 *
 * Laravel `OrderController::getOverallReport`. `Customer_details.name` and
 * `.mobile` reference columns that do not exist on `customers`, so they are
 * always `null`.
 */
async function getOverallReport(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const input = await readCommerceInput(request);
    const customerId = /^-?\d+$/.test(String(input.customer_id))
      ? Number(input.customer_id)
      : null;
    const customer =
      customerId === null
        ? null
        : await prisma.customers.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({
        status: false,
        message: "Customer not found.",
      });
    }

    const orders = await prisma.orders.findMany({
      where: {
        user_id: auth.user.id,
        customer_id: customer.id,
        is_deleted: 0,
      },
      orderBy: { id: "asc" },
    });

    const orderIds = orders.map((order) => order.id);
    const items = orderIds.length
      ? await prisma.order_items.findMany({
          where: { order_id: { in: orderIds } },
          orderBy: { id: "asc" },
        })
      : [];
    const productIds = [...new Set(items.map((item) => item.product_id))];
    const products = productIds.length
      ? await prisma.products.findMany({ where: { id: { in: productIds } } })
      : [];
    const productById = new Map(products.map((product) => [product.id, product]));

    let totalPreviousBalance = 0;
    let totalSubtotal = 0;
    let totalPaidAmount = 0;
    let totalCurrentDayBalance = 0;
    let totalRemainingBalance = 0;
    for (const order of orders) {
      totalPreviousBalance += Number(order.previous_balance);
      totalSubtotal += Number(order.subtotal);
      totalPaidAmount += Number(order.paid_amount);
      totalCurrentDayBalance += Number(order.current_day_balance);
      totalRemainingBalance += Number(order.remaining_balance);
    }

    const orderDetails = orders.map((order) => {
      const orderItems = items
        .filter((item) => item.order_id === order.id)
        .map((item) => {
          const product = productById.get(item.product_id);
          const stock = Number(product?.stock ?? 0);
          return {
            product_name: product?.product_name,
            quantity_ordered: item.quantity,
            stock_available: product?.stock,
            stock_after_order: Math.max(0, stock - item.quantity),
          };
        });

      return {
        order_id: order.id,
        previous_balance: order.previous_balance,
        subtotal: order.subtotal,
        paid_amount: order.paid_amount,
        current_day_balance: order.current_day_balance,
        remaining_balance: order.remaining_balance,
        order_items: orderItems,
      };
    });

    return NextResponse.json({
      status: true,
      message: "Overall report retrieved successfully.",
      data: serializeCommerce({
        Customer_details: {
          name: null,
          mobile: null,
          username: customer.username,
          userbusiness_name: customer.userbusiness_name,
          userphoto: customer.userphoto ? laravelUrl(request, customer.userphoto) : null,
          userbusiness_photo: customer.userbusiness_photo
            ? laravelUrl(request, customer.userbusiness_photo)
            : null,
          customer_balance_summary: {
            total_previous_balance: totalPreviousBalance,
            total_subtotal: totalSubtotal,
            total_paid_amount: totalPaidAmount,
            total_current_day_balance: totalCurrentDayBalance,
            total_remaining_balance: totalRemainingBalance,
          },
          orders_summary: {
            total_orders: orders.length,
            total_collected: totalPaidAmount,
            total_remaining_balance: totalRemainingBalance,
          },
          order_details: orderDetails,
        },
      }),
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to generate the report.",
    });
  }
}

export const GET = getOverallReport;
export const POST = getOverallReport;
export const PUT = getOverallReport;
export const PATCH = getOverallReport;
export const DELETE = getOverallReport;
