import type { Metadata } from "next";
import { connection } from "next/server";

import AuthShell from "@/components/auth/auth-shell";
import { t } from "@/lib/i18n";

export const instant = false;

export const metadata: Metadata = {
  title: "Forgot Password | BCT Labs",
};

/**
 * `password.request` -> GET /password/reset, showing
 * `resources/views/auth/passwords/email.blade.php`. The form posts to
 * `POST /password/email` (`password.email`).
 */
export default async function PasswordRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ errors?: string }>;
}) {
  await connection();
  const { errors } = await searchParams;

  return (
    <AuthShell>
      <div className="card card-primary">
        <div className="card-header">
          <h4>{t("email.reset_password")}</h4>
        </div>

        <div className="card-body">
          <form method="POST" action="/password/email">
            <div className="form-group">
              <label htmlFor="email">{t("email.send_reset_link")}:</label>
              <span className="text-danger">*</span>
              <input
                id="email"
                type="email"
                className={`form-control${errors ? " is-invalid" : ""}`}
                name="email"
                tabIndex={1}
                autoFocus
                required
                placeholder={t("placeholder.enter_email")}
              />
              <div className="invalid-feedback">{errors}</div>
            </div>
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                tabIndex={4}
              >
                {t("email.send_reset_link")}
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
