import "server-only";

import { readRequestBody } from "./api-format";
import { prisma } from "./prisma";

/**
 * Laravel's `$request->all()` for the admin forms: unlike the ticket helpers
 * this keeps single uploaded `File` values in place so the `image` / `mimes`
 * rules can inspect them.
 */
export async function readAdminBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const body: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      body[key] = value;
    }
    return body;
  }
  return readRequestBody(request);
}

/**
 * Shared validation for the admin `add_user` / `edit_user` endpoints. Mirrors
 * the Laravel rule set declared in `AuthController::addUser` / `editUser` and
 * returns the first error message exactly like
 * `array_values($validator->errors()->toArray())[0][0]`.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

async function uniqueViolation(
  column: "email" | "phone",
  value: string,
  excludeUserId: number | null,
): Promise<boolean> {
  const where =
    excludeUserId === null
      ? { [column]: value }
      : { [column]: value, NOT: { id: excludeUserId } };
  return (await prisma.users.findFirst({ where })) !== null;
}

/**
 * `partial` mirrors the `nullable|` prefix used by `editUser`; `userId` (when
 * provided) is excluded from the `unique` checks.
 */
export async function validateUserPayload(
  body: Record<string, unknown>,
  options: { partial: boolean; userId?: number },
): Promise<string | null> {
  const partial = options.partial;
  const excludeUserId = options.userId ?? null;

  const name = body.name;
  if (!partial || !isBlank(name)) {
    if (isBlank(name)) return "The name field is required.";
    if (typeof name !== "string") return "The name field must be a string.";
    if (name.length > 255) {
      return "The name field must not be greater than 255 characters.";
    }
  }

  const email = body.email;
  if (!partial || !isBlank(email)) {
    if (isBlank(email)) return "The email field is required.";
    if (typeof email !== "string") return "The email field must be a string.";
    if (!EMAIL_PATTERN.test(email)) {
      return "The email field must be a valid email address.";
    }
    if (email.length > 255) {
      return "The email field must not be greater than 255 characters.";
    }
    if (await uniqueViolation("email", email, excludeUserId)) {
      return "The email has already been taken.";
    }
  }

  const mobile = body.mobile;
  if (!partial || !isBlank(mobile)) {
    if (isBlank(mobile)) return "The mobile field is required.";
    if (typeof mobile !== "string") {
      return "The mobile field must be a string.";
    }
    if (mobile.length > 15) {
      return "The mobile field must not be greater than 15 characters.";
    }
    if (await uniqueViolation("phone", mobile, excludeUserId)) {
      return "The mobile has already been taken.";
    }
  }

  const password = body.password;
  if (!partial || !isBlank(password)) {
    if (isBlank(password)) return "The password field is required.";
    if (typeof password !== "string") {
      return "The password field must be a string.";
    }
    if (password.length < 8) {
      return "The password field must be at least 8 characters.";
    }
    if (password !== body.password_confirmation) {
      return "The password field confirmation does not match.";
    }
  }

  const type = body.type;
  if (!partial || !isBlank(type)) {
    if (isBlank(type)) return "The type field is required.";
    if (typeof type !== "string") return "The type field must be a string.";
    if (type !== "personal" && type !== "business") {
      return "The selected type is invalid.";
    }
  }

  for (const [field, file] of [
    ["profile_picture", body.profile_picture],
    ["logo", body.logo],
  ] as const) {
    if (isBlank(file)) {
      continue;
    }
    const label = field === "profile_picture" ? "profile picture" : "logo";
    if (!(file instanceof File)) {
      return `The ${label} field must be an image.`;
    }
    if (!IMAGE_MIMES.includes(file.type)) {
      return `The ${label} field must be a file of type: jpeg, png, jpg, gif.`;
    }
    if (file.size > 2048 * 1024) {
      return `The ${label} must not be greater than 2048 kilobytes.`;
    }
  }

  return null;
}
