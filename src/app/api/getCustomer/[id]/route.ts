import { NextResponse } from "next/server";

import { serializeCommerce } from "@/lib/api-commerce";
import { laravelUrl } from "@/lib/api-format";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * GET /api/getCustomer/{id}
 *
 * Laravel `CustomerController::getCustomer`.
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
    const customerId = /^-?\d+$/.test(id) ? Number(id) : null;
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

    const data = serializeCommerce(customer) as Record<string, unknown>;
    delete data.user_id;
    data.userphoto = customer.userphoto ? laravelUrl(request, customer.userphoto) : null;
    data.userbusiness_photo = customer.userbusiness_photo
      ? laravelUrl(request, customer.userbusiness_photo)
      : null;

    return NextResponse.json({
      status: true,
      message: "Customer retrieved successfully.",
      data,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to retrieve customer.",
    });
  }
}
