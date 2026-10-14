import type { Metadata } from "next";
import { connection } from "next/server";

import AuthShell from "@/components/auth/auth-shell";
import { t } from "@/lib/i18n";
import { resetPassword } from "../actions";

export const instant = false;

export const metadata: Metadata = {
  title: "Reset Password | BCT Labs",
};

/**
 * `password.reset` -> GET /password/reset/{token}, showing
 * `resources/views/auth/passwords/reset.blade.php`. `POST /password/reset`
 * (`password.update`) is implemented as the `resetPassword` server action: Next
 * forbids a `route.ts` and a `page.tsx` in the same route segment, and Laravel
 * posts to the same `/password/reset` URL that renders this page.
 */
export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  const { token } = await params;
  const { error } = await searchParams;

  return (
    <AuthShell>
      <div className="card card-primary">
        <div className="card-header">
          <h4>{t("reset.set_a_new_password")}</h4>
        </div>

        <div className="card-body">
          <form action={resetPassword}>
            <input type="hidden" name="token" value={token} />
            <div className="form-group">
              <label htmlFor="email">{t("reset.email")}:</label>
              <span className="text-danger">*</span>
              <input
                id="email"
                type="email"
                className={`form-control${error ? " is-invalid" : ""}`}
                name="email"
                tabIndex={1}
                autoFocus
              />
              <div className="invalid-feedback">{error}</div>
            </div>
            <div className="form-group">
              <label htmlFor="password" className="control-label">
                {t("reset.password")}&quot;
              </label>
              <span className="text-danger">*</span>
              <input
                id="password"
                type="password"
                className="form-control"
                name="password"
                tabIndex={2}
              />
              <div className="invalid-feedback"></div>
            </div>
            <div className="form-group">
              <label htmlFor="password_confirmation" className="control-label">
                {t("reset.confirm_password")}:
              </label>
              <span className="text-danger">*</span>
              <input
                id="password_confirmation"
                type="password"
                className="form-control"
                name="password_confirmation"
                tabIndex={2}
              />
              <div className="invalid-feedback"></div>
            </div>
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                tabIndex={4}
              >
                {t("reset.set_a_new_password")}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="mt-5 text-muted text-center">
        {t("reset.recalled_your_login_info")}{" "}
        <a href="/login">{t("reset.sign_in")}</a>
      </div>
    </AuthShell>
  );
}
