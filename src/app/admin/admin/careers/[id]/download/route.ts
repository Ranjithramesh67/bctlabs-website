import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { setFlash } from "@/lib/admin/flash";
import { loadCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** PHP `pathinfo($path, PATHINFO_EXTENSION)`. */
function pathinfoExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filePath.length - 1) {
    return "";
  }
  return filePath.slice(lastDot + 1);
}

/** CareerApplicationController::download. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await loadCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const application = await prisma.career_applications.findUnique({
    where: { id: BigInt(numericId) },
  });
  if (!application) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  // The store route writes resumes to `public/career/<resume_path>`.
  const filePath = path.join(
    process.cwd(),
    "public",
    "career",
    application.resume_path,
  );

  let file: Buffer;
  try {
    file = await readFile(filePath);
  } catch {
    await setFlash("error", "File not found");
    return NextResponse.redirect(
      new URL("/admin/admin/careers", request.url),
    );
  }

  const extension = pathinfoExtension(application.resume_path).toLowerCase();
  const downloadName = `${application.name}_resume.${extension}`;

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
    },
  });
}
