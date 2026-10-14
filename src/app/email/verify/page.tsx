import type { Metadata } from "next";
import { connection } from "next/server";

import AdminLayout from "@/app/admin/layout";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

export const metadata: Metadata = {
  title: "BCT Labs",
};

/**
 * `verification.notice` -> `resources/views/auth/verify.blade.php`, rendered
 * within the admin `layouts.app` shell (`auth` middleware).
 */
export default async function EmailVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ resent?: string }>;
}) {
  await connection();
  await getCurrentUser();
  const { resent } = await searchParams;

  return (
    <AdminLayout>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">Verify Your Email Address</div>

              <div className="card-body">
                {resent ? (
                  <div className="alert alert-success" role="alert">
                    A fresh verification link has been sent to your email
                    address.
                  </div>
                ) : null}

                Before proceeding, please check your email for a verification
                link. If you did not receive the email,
                <form
                  className="d-inline"
                  method="POST"
                  action="/email/resend"
                >
                  <button
                    type="submit"
                    className="btn btn-link p-0 m-0 align-baseline"
                  >
                    click here to request another
                  </button>
                </form>
                .
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
