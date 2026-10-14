import type { Metadata } from "next";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  await connection();
  await getCurrentUser();

  // Laravel: User::whereDate('created_at', Carbon::today()) compares only the
  // date part, so mirror it with the [start of today, start of tomorrow) range.
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [totalCustomers, totalAppDownloads, todayAppDownloads] =
    await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { created_at: { not: null } } }),
      prisma.users.count({
        where: { created_at: { gte: startOfToday, lt: startOfTomorrow } },
      }),
    ]);

  return (
    <>
      <style>{`
        .fa-2x {
            font-size: 1.6em !important;
        }
      `}</style>
      <section className="section">
        <div className="section-header">
          <h1>{t("dashboard")}</h1>
        </div>
      </section>
      <div className="row">
        <div className="col-xl-4">
          <div className="card mb-3 d-total-one-border">
            <div className="card-body">
              <div className="job-icon pt-4 pt-sm-0 d-flex justify-content-between">
                <div>
                  <h2 className="mb-0 lh-1">{totalCustomers}</h2>
                  <span className="fs-14 d-block mb-2">Total Customers</span>
                </div>
                <i className="fas fa-user fa-2x me-3 text-primary"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card mb-3 d-total-six-border">
            <div className="card-body">
              <div className="job-icon d-flex justify-content-between">
                <div>
                  <h2 className="mb-0 lh-1">{todayAppDownloads}</h2>
                  <span className="fs-14 d-block mb-2">
                    Today App Download Customers
                  </span>
                </div>
                <i className="fas fa-calendar-check fa-2x me-3 text-danger"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card mb-3 d-total-two-border">
            <div className="card-body">
              <div className="job-icon pt-4 pt-sm-0 d-flex justify-content-between">
                <div>
                  <h2 className="mb-0 lh-1">{totalAppDownloads}</h2>
                  <span className="fs-14 d-block mb-2">Total App Downloads</span>
                </div>
                <i className="fas fa-download fa-2x me-3 text-success"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
