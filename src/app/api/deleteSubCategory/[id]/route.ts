import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * DELETE /api/deleteSubCategory/{id}
 *
 * Laravel `SubCategoryController::deleteSubCategory`.
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
    const subCategoryId = /^-?\d+$/.test(id) ? Number(id) : null;
    const subCategory =
      subCategoryId === null
        ? null
        : await prisma.sub_categories.findUnique({
            where: { id: subCategoryId },
          });
    if (!subCategory) {
      return NextResponse.json({
        status: false,
        message: "SubCategory not found.",
      });
    }

    await prisma.sub_categories.update({
      where: { id: subCategory.id },
      data: { is_deleted: true },
    });

    return NextResponse.json({
      status: true,
      message: "SubCategory deleted successfully.",
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to delete subcategory.",
    });
  }
}
