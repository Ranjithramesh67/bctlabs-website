import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * DELETE /api/deleteproduct/{id}
 *
 * Laravel `ProductController::deleteproduct` (soft delete via `is_delete`).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const productId = /^-?\d+$/.test(id) ? Number(id) : null;
    const product =
      productId === null
        ? null
        : await prisma.products.findUnique({ where: { id: productId } });
    if (!product) {
      throw new Error("Product not found");
    }

    await prisma.products.update({
      where: { id: product.id },
      data: { is_delete: true },
    });

    return NextResponse.json({
      status: true,
      message: "Product deleted successfully.",
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to delete product.",
    });
  }
}
