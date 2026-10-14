import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { ADMIN_HOME, homeForUser, loadUserById } from "@/lib/auth";
import {
  errorResponse,
  isFormRequest,
  redirectTo,
  validationError,
} from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { registerSchema } from "@/lib/validation/auth";

export const instant = false;

// Laravel's bcrypt cost (existing hashes use `$2y$10$`).
const BCRYPT_ROUNDS = 10;

export async function POST(request: Request) {
  const form = isFormRequest(request);
  let body: unknown;
  if (form) {
    const data = await request.formData();
    body = {
      first_name: data.get("first_name"),
      last_name: data.get("last_name"),
      email: data.get("email"),
      phone: data.get("phone"),
      password: data.get("password"),
      password_confirmation: data.get("password_confirmation"),
    };
  } else {
    body = await request.json().catch(() => null);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    if (form) {
      return redirectTo(request, "/register", { status: "invalid" });
    }
    return validationError(parsed.error);
  }

  const { first_name, last_name, email, phone, password } = parsed.data;

  const existing = await prisma.users.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    if (form) {
      return redirectTo(request, "/register", { status: "email_taken" });
    }
    return NextResponse.json(
      {
        message: "The given data was invalid.",
        errors: { email: ["The email has already been taken."] },
      },
      { status: 422 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const created = await prisma.users.create({
    data: {
      first_name,
      last_name: last_name ?? null,
      phone: phone ?? null,
      email,
      password: hashedPassword,
    },
    select: { id: true },
  });

  const user = await loadUserById(created.id);
  if (!user) {
    return errorResponse("Unable to create the account.", 500);
  }

  // Laravel's `RegistersUsers` signs the user in after registration.
  await createSession({ userId: user.id, roles: user.roles });

  const redirect = user.roles.length > 0 ? homeForUser(user) : ADMIN_HOME;
  if (form) {
    return redirectTo(request, redirect);
  }

  return NextResponse.json(
    {
      user,
      redirect,
    },
    { status: 201 },
  );
}
