import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { validationError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { careerApplicationSchema } from "@/lib/validation/site";

export const instant = false;

/** Laravel `Str::slug`: lowercase ASCII, non-alphanumerics collapsed to `-`. */
function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Laravel's `UploadedFile::extension()` guesses the extension from the mime type.
const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

function resumeExtension(file: File): string {
  return (
    EXTENSION_BY_MIME[file.type] ??
    file.name.split(".").pop()?.toLowerCase() ??
    "bin"
  );
}

/**
 * Accept both multipart form data (the site form) and JSON, and never throw on
 * a malformed body — Laravel would surface those as validation errors.
 */
async function readFields(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => null);
    return json && typeof json === "object"
      ? (json as Record<string, unknown>)
      : {};
  }
  try {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  } catch {
    return {};
  }
}

/**
 * POST /careers -> `CareerApplicationController::store`.
 *
 * Multipart upload; the file is written to `public/career` using the original
 * filename algorithm (`slug(name) + "_file" + extension`).
 */
export async function POST(request: Request) {
  const fields = await readFields(request);

  const parsed = careerApplicationSchema.safeParse({
    name: fields.name,
    mobile: fields.mobile,
    email: fields.email,
    resume: fields.resume,
    address: fields.address,
    qualification: fields.qualification,
    dob: fields.dob,
    gender: fields.gender,
    whatsappMobile: fields.whatsappMobile,
    yearofexperience: fields.yearofexperience,
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  // Laravel's `unique:career_applications,email`.
  const existing = await prisma.career_applications.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        message: "The given data was invalid.",
        errors: { email: ["The email has already been taken."] },
      },
      { status: 422 },
    );
  }

  const resumePath = `${slug(parsed.data.name)}_file${resumeExtension(parsed.data.resume)}`;

  try {
    const directory = path.join(process.cwd(), "public", "career");
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, resumePath),
      Buffer.from(await parsed.data.resume.arrayBuffer()),
    );

    await prisma.career_applications.create({
      data: {
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        email: parsed.data.email,
        resume_path: resumePath,
        address: parsed.data.address,
        qualification: parsed.data.qualification,
        dob: parsed.data.dob,
        gender: parsed.data.gender,
        whatsappMobile: parsed.data.whatsappMobile,
        yearofexperience: parsed.data.yearofexperience,
      },
    });
  } catch (error) {
    console.error("Career application failed:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
