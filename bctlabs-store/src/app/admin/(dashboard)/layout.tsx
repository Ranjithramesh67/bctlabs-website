import type { ReactNode } from "react";
import Link from "next/link";

import { AdminNav, AdminSignOutButton } from "@/components/admin-nav";
import { ButtonLink } from "@/components/ui";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Server Component: guarded shell for all authenticated admin screens.
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  // Redirects to /admin/login when the visitor is not signed-in staff.
  const session = await requireAdmin();
  const name = session.name ?? session.email ?? "Admin";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">
              B
            </span>
            <span className="text-base font-extrabold tracking-tight text-ink-900 sm:text-lg">
              BCTLABS Admin
            </span>
          </Link>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold leading-tight text-slate-800">{name}</p>
              {session.email ? (
                <p className="hidden truncate text-xs leading-tight text-slate-500 sm:block">{session.email}</p>
              ) : null}
            </div>
            <ButtonLink href="/" variant="outline" size="sm">
              View store
            </ButtonLink>
            <AdminSignOutButton className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-600" />
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1 flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <AdminNav />
        </aside>
        <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
