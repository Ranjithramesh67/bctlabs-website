import type { Metadata } from "next";
import { connection } from "next/server";

import AuthShell from "@/components/auth/auth-shell";
import { t } from "@/lib/i18n";
import { RegisterForm } from "./register-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Register | BCT Labs",
};

/** Faithful port of `resources/views/auth/register.blade.php`. */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  await connection();

  // Messages for the no-JS form fallback (the API redirects back with `status`).
  const statusMessage =
    status === "email_taken"
      ? "The email has already been taken."
      : status === "invalid"
        ? "Please check the form for errors and try again."
        : null;

  return (
    <AuthShell>
      <div className="card card-primary">
        <div className="card-header">
          <h4>{t("register.register")}</h4>
        </div>

        <div className="card-body pt-1">
          {statusMessage ? (
            <div className="alert alert-danger p-0">
              <ul className="mb-0">
                <li>{statusMessage}</li>
              </ul>
            </div>
          ) : null}
          <RegisterForm />
        </div>
      </div>
      <div className="mt-5 text-muted text-center">
        {t("register.already_have_an_account")}{" "}
        <a href="/login">{t("register.sign_in")}</a>
      </div>
    </AuthShell>
  );
}
