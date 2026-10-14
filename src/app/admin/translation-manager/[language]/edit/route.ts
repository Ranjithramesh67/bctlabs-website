import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * `TranslationManagerController::edit` — returns the language as JSON so the
 * edit modal can be populated without a full page reload, mirroring the
 * original AJAX flow (`route('translation.manager.edit', id)`).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ language: string }> },
) {
  await getCurrentUser();

  const { language } = await params;
  const id = Number(language);
  const record =
    Number.isInteger(id) && id > 0
      ? await prisma.languages.findUnique({ where: { id } })
      : null;

  if (!record) {
    return NextResponse.json(
      { success: false, message: "Language not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: record.id,
      name: record.name,
      description: record.description,
      is_default: record.is_default,
      is_app_language: record.is_app_language,
    },
    message: "Language data retrieved successfully.",
  });
}
