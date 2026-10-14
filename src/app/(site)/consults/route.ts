import { NextResponse } from "next/server";

import { validationError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { consultationSchema } from "@/lib/validation/site";

export const instant = false;

/** Build a date-only value (UTC midnight) from the submitted `YYYY-MM-DD`. */
function toDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
    );
  }
  return new Date(value);
}

/** Build a time-of-day value for the `TIME` column from `HH:MM[:SS]`. */
function toTimeDate(value: string): Date {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(value);
  const hours = match ? Number(match[1]) : 0;
  const minutes = match ? Number(match[2]) : 0;
  const seconds = match?.[3] ? Number(match[3]) : 0;
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
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
 * POST /consults -> `CareerApplicationController::store_consoult`.
 *
 * Inserts into `consultations`; `class` -> `class_range` and `strength` ->
 * `student_strength`.
 */
export async function POST(request: Request) {
  const fields = await readFields(request);

  const parsed = consultationSchema.safeParse({
    name: fields.name,
    designation: fields.designation,
    lab_type: fields.lab_type,
    school: fields.school,
    city: fields.city,
    mobile: fields.mobile,
    email: fields.email,
    class: fields.class,
    strength: fields.strength,
    preferred_date: fields.preferred_date,
    preferred_time: fields.preferred_time,
    preferred_mode: fields.preferred_mode,
    heard_about: fields.heard_about,
    questions: fields.questions,
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    await prisma.consultations.create({
      data: {
        name: parsed.data.name,
        designation: parsed.data.designation,
        lab_type: parsed.data.lab_type,
        school: parsed.data.school,
        city: parsed.data.city,
        mobile: parsed.data.mobile,
        email: parsed.data.email,
        class_range: parsed.data.class,
        student_strength: parsed.data.strength,
        preferred_date: toDate(parsed.data.preferred_date),
        preferred_time: toTimeDate(parsed.data.preferred_time),
        preferred_mode: parsed.data.preferred_mode,
        heard_about: parsed.data.heard_about,
        questions: parsed.data.questions,
      },
    });
  } catch (error) {
    console.error("Consultation failed:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
