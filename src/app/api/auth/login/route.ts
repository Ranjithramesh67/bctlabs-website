import { NextResponse } from "next/server";

import {
  DISABLED_ACCOUNT_MESSAGE,
  homeForUser,
  loadUserById,
  verifyCredentials,
} from "@/lib/auth";
import {
  errorResponse,
  isFormRequest,
  redirectTo,
  validationError,
} from "@/lib/http";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation/auth";

export const instant = false;

/** Only allow same-site absolute paths, never protocol-relative/off-site ones. */
function safeIntended(value: string | null | undefined): string | null {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return null;
}

export async function POST(request: Request) {
  const form = isFormRequest(request);
  let body: unknown;
  if (form) {
    const data = await request.formData();
    body = {
      email: data.get("email"),
      password: data.get("password"),
      remember: data.get("remember"),
      intended: data.get("intended"),
    };
  } else {
    body = await request.json().catch(() => null);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    if (form) {
      return redirectTo(request, "/login", { status: "invalid" });
    }
    return validationError(parsed.error);
  }

  const { email, password, remember, intended } = parsed.data;
  const userId = await verifyCredentials(email, password);
  if (userId === null) {
    // Laravel's `auth.failed` message.
    if (form) {
      return redirectTo(request, "/login", { status: "failed" });
    }
    return errorResponse("These credentials do not match our records.", 422);
  }

  const user = await loadUserById(userId);
  if (!user) {
    if (form) {
      return redirectTo(request, "/login", { status: "failed" });
    }
    return errorResponse("These credentials do not match our records.", 422);
  }

  // Mirrors the `CheckUserStatus` middleware: disabled accounts are rejected.
  if (!user.isEnable) {
    if (form) {
      return redirectTo(request, "/login", { status: "disabled" });
    }
    return errorResponse(DISABLED_ACCOUNT_MESSAGE, 403);
  }

  await createSession({ userId: user.id, roles: user.roles, remember });

  const redirect = safeIntended(intended) ?? homeForUser(user);
  if (form) {
    return redirectTo(request, redirect);
  }

  return NextResponse.json({
    user,
    redirect,
  });
}
