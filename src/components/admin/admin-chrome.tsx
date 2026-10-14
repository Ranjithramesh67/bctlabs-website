"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AdminNavbar } from "@/components/admin/admin-navbar";
import {
  AdminSidebar,
  type NavEntry,
} from "@/components/admin/admin-sidebar";
import { Flash } from "@/components/admin/flash";
import type { FlashMessage } from "@/lib/admin/flash";

type Props = {
  appName: string;
  appLogo: string;
  entries: NavEntry[];
  hasDashboardHeader: boolean;
  firstName: string;
  fullName: string;
  imageUrl: string;
  flash: FlashMessage | null;
  children: React.ReactNode;
};

/**
 * Admin shell: fixed sidebar on desktop, an off-canvas drawer with a backdrop
 * on small screens. Replaces the behaviour Stisla's `scripts.js` provided in
 * the Laravel app (which toggled `body.sidebar-gone`).
 */
export function AdminChrome({
  appName,
  appLogo,
  entries,
  hasDashboardHeader,
  firstName,
  fullName,
  imageUrl,
  flash,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever navigation happens.
  useEffect(() => {
    // Syncing to an external value (the active route) rather than deriving
    // state from props; the extra render is intentional and harmless.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Lock background scrolling while the drawer covers the page.
  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div
      className={`main-wrapper main-wrapper-1 ${open ? "admin-sidebar-open" : ""}`}
    >
      <div className="navbar-bg"></div>
      <nav className="navbar navbar-expand-lg main-navbar">
        <AdminNavbar
          firstName={firstName}
          fullName={fullName}
          imageUrl={imageUrl}
          sidebarOpen={open}
          onToggleSidebar={() => setOpen((value) => !value)}
        />
      </nav>
      <Suspense fallback={<div className="main-sidebar" />}>
        <AdminSidebar
          appName={appName}
          appLogo={appLogo}
          entries={entries}
          hasDashboardHeader={hasDashboardHeader}
          onNavigate={() => setOpen(false)}
        />
      </Suspense>
      <button
        type="button"
        className="admin-sidebar-backdrop"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <div className="main-content">
        <Flash flash={flash} />
        {children}
      </div>
    </div>
  );
}
