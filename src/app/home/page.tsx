import type { Metadata } from "next";
import { connection } from "next/server";

import AdminLayout from "@/app/admin/layout";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

export const metadata: Metadata = {
  title: "BCT Labs",
};

/**
 * `HomeController::index` -> `resources/views/home.blade.php`, rendered within
 * the admin `layouts.app` shell. Guards with `getCurrentUser()` (the
 * `HomeController` constructor applies the `auth` middleware).
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await connection();
  await getCurrentUser();
  const { status } = await searchParams;

  return (
    <AdminLayout>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">Dashboard</div>

              <div className="card-body">
                {status ? (
                  <div className="alert alert-success" role="alert">
                    {status}
                  </div>
                ) : null}

                You are logged in!
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
