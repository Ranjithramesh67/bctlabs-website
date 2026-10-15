import type { Metadata } from "next";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  await connection();
  await getCurrentUser();

  return (
    // Laravel's dashboard view has every widget commented out; it renders only
    // the section heading (plus the flash message handled by the layout).
    <section className="section">
      <div className="section-header">
        <h1>{t("dashboard")}</h1>
      </div>
    </section>
  );
}
