import { NextResponse } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import {
  isFilled,
  readCommerceInput,
  serializeCommerce,
  urlAttribute,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * ANY /api/getCustomer_list
 *
 * Laravel `CustomerController::getCustomer_list`. The original calls
 * `$customers->getCollection()->transform(...)` on an Eloquent collection;
 * `getCollection()` does not exist there, so the code intent (convert the photo
 * columns to absolute URLs) is reproduced here rather than the resulting
 * `BadMethodCallException`.
 */
async function getCustomerList(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const input = await readCommerceInput(request);
    const where: Prisma.customersWhereInput = {};

    if (isFilled(input.phone)) {
      where.mobile_number = { contains: String(input.phone) };
    }
    if (isFilled(input.userbusiness_name)) {
      where.userbusiness_name = { contains: String(input.userbusiness_name) };
    }
    if (isFilled(input.username)) {
      where.username = { contains: String(input.username) };
    }
    if (isFilled(input.created_at)) {
      const day = String(input.created_at).slice(0, 10);
      const start = new Date(`${day}T00:00:00.000Z`);
      if (Number.isNaN(start.getTime())) {
        return NextResponse.json({
          status: true,
          message: "Customers fetched successfully.",
          data: [],
        });
      }
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      where.created_at = { gte: start, lt: end };
    }

    const customers = await prisma.customers.findMany({
      where,
      orderBy: { id: "asc" },
    });

    const data = customers.map((customer) => {
      const item = serializeCommerce(customer) as Record<string, unknown>;
      delete item.user_id;
      item.userphoto = urlAttribute(request, customer.userphoto);
      item.userbusiness_photo = urlAttribute(request, customer.userbusiness_photo);
      return item;
    });

    return NextResponse.json({
      status: true,
      message: "Customers fetched successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch customer list.",
    });
  }
}

export const GET = getCustomerList;
export const POST = getCustomerList;
export const PUT = getCustomerList;
export const PATCH = getCustomerList;
export const DELETE = getCustomerList;
