import type { Metadata } from "next";
import { connection } from "next/server";

import AdminLayout from "@/app/admin/layout";
import { getCurrentUser } from "@/lib/auth";
import { confirmPassword } from "./actions";

export const instant = false;

export const metadata: Metadata = {
  title: "BCT Labs",
};

/**
 * `password.confirm` -> GET /password/confirm, showing
 * `resources/views/auth/passwords/confirm.blade.php` inside the admin
 * `layouts.app` shell (`auth` middleware).
 *
 * NOTE: `src/proxy.ts` treats every `/password/*` path as a guest route, so
 * signed-in users are bounced to their home before this page renders (a known
 * gap — the proxy was intentionally left untouched).
 */
export default async function ConfirmPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  await getCurrentUser();
  const { error } = await searchParams;

  return (
    <AdminLayout>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">Confirm Password</div>

              <div className="card-body">
                Please confirm your password before continuing.
                <form method="POST" action={confirmPassword}>
                  <div className="form-group row">
                    <label
                      htmlFor="password"
                      className="col-md-4 col-form-label text-md-right"
                    >
                      Password
                    </label>

                    <div className="col-md-6">
                      <input
                        id="password"
                        type="password"
                        className={`form-control${error ? " is-invalid" : ""}`}
                        name="password"
                        required
                        autoComplete="current-password"
                      />

                      {error ? (
                        <span className="invalid-feedback" role="alert">
                          <strong>{error}</strong>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="form-group row mb-0">
                    <div className="col-md-8 offset-md-4">
                      <button type="submit" className="btn btn-primary">
                        Confirm Password
                      </button>

                      <a className="btn btn-link" href="/password/reset">
                        Forgot Your Password?
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
