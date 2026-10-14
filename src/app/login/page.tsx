import type { Metadata } from "next";
import { connection } from "next/server";

import AuthShell from "@/components/auth/auth-shell";
import { DISABLED_ACCOUNT_MESSAGE } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { LoginForm } from "./login-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Login | BCT Labs",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ intended?: string; status?: string }>;
}) {
  const { intended, status } = await searchParams;
  await connection();

  // Messages for the no-JS form fallback (`/api/auth/login` redirects back
  // with a `status` query param, mirroring Laravel's `withErrors`).
  const statusMessage =
    status === "disabled"
      ? DISABLED_ACCOUNT_MESSAGE
      : status === "failed"
        ? "These credentials do not match our records."
        : status === "invalid"
          ? "Please enter a valid email and password."
          : null;

  return (
    <AuthShell>
      <div className="card card-primary">
        {statusMessage ? (
          <div className="alert alert-danger">
            <ul className="mb-0">
              <li>{statusMessage}</li>
            </ul>
          </div>
        ) : null}
        <div className="card-header">
          <h4>{t("login.login")}</h4>
        </div>

        <div className="card-body">
          <LoginForm intended={intended} />
        </div>
      </div>
    </AuthShell>
  );
}
