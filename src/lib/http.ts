import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * True when the request came from a plain HTML form submit rather than a
 * client-side `fetch`. The original Blade forms are classic synchronous POSTs,
 * so endpoints must accept both encodings.
 */
export function isFormRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  );
}

/** 303 back to a page, mirroring Laravel's `redirect()->back()->withErrors()`. */
export function redirectTo(
  request: Request,
  path: string,
  query?: Record<string, string>,
): NextResponse {
  const url = new URL(path, request.url);
  for (const [key, value] of Object.entries(query ?? {})) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url, 303);
}

/**
 * Laravel-compatible validation error response: 422 with a `message` and an
 * `errors` map keyed by field name.
 */
export function validationError(error: z.ZodError): NextResponse {
  const { fieldErrors, formErrors } = z.flattenError(error);
  return NextResponse.json(
    {
      message: "The given data was invalid.",
      errors: fieldErrors,
      form_errors: formErrors,
    },
    { status: 422 },
  );
}

export function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ message }, { status });
}
