import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * DELETE /api/delete_category/{id}
 *
 * Laravel `CategoryController::deleteCategory` (soft delete via `is_deleted`).
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
    const categoryId = /^-?\d+$/.test(id) ? Number(id) : null;
    const category =
      categoryId === null
        ? null
        : await prisma.categories.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({
        status: false,
        message: "Category not found.",
      });
    }

    await prisma.categories.update({
      where: { id: category.id },
      data: { is_deleted: 1 },
    });

    return NextResponse.json({
      status: true,
      message: "Category marked as deleted successfully.",
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to delete category.",
    });
  }
}
