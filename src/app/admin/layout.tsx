import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { AdminNavbar } from "@/components/admin/admin-navbar";
import {
  AdminSidebar,
  type NavEntry,
} from "@/components/admin/admin-sidebar";
import { Flash } from "@/components/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/admin/permissions";
import { readFlash } from "@/lib/admin/flash";
import { getAppLogo, getAppName } from "@/lib/admin/settings";
import { userAvatarUrl } from "@/lib/api-users";

export const instant = false;

export const metadata: Metadata = {
  title: "BCT Labs",
};

function AdminStyles() {
  return (
    <>
      <link
        rel="stylesheet"
        href="/assets/css/bootstrap.min.css"
        precedence="high"
      />
      <link rel="stylesheet" href="/assets/css/sweetalert.css" />
      <link
        rel="stylesheet"
        href="/assets/css/@fortawesome/fontawesome-free/css/all.css"
      />
      <link rel="stylesheet" href="/assets/css/iziToast.min.css" />
      <link rel="stylesheet" href="/assets/css/select2.min.css" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700"
      />
      <link rel="stylesheet" href="/assets/web/css/style.css" precedence="high" />
      <link rel="stylesheet" href="/assets/web/css/components.css" />
      <link rel="stylesheet" href="/assets/css/custom.css" />
    </>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The footer renders the current year and settings come from the DB, so the
  // shell must be rendered per-request rather than prerendered.
  await connection();
  const user = await getCurrentUser();
  const [appName, appLogo, canManageStaff] = await Promise.all([
    getAppName(),
    getAppLogo(),
    can(user, "manage_staff_member"),
  ]);

  const entries: NavEntry[] = [];

  if (canManageStaff) {
    entries.push({
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: "fas fa-lg fa-tachometer-alt",
    });
    entries.push({
      label: "Blog",
      icon: "fas fa-blog fa-lg",
      match: ["/admin/get_blogcategory", "/admin/event/index"],
      items: [
        {
          label: "Blog Category",
          href: "/admin/get_blogcategory",
          icon: "fas fa-icons text-danger",
        },
        {
          label: "Blog",
          href: "/admin/event/index?pages=blog",
          icon: "fas fa-blog fa-lg",
          match: "/admin/event/index",
          pages: "blog",
        },
      ],
    });
    entries.push({
      label: "Events",
      href: "/admin/event/index?pages=event",
      icon: "fas fa-calendar-alt fa-lg",
      match: "/admin/event/index",
      pages: "event",
    });
    entries.push({
      label: "News",
      href: "/admin/event/index?pages=news",
      icon: "fas fa-newspaper fa-lg",
      match: "/admin/event/index",
      pages: "news",
    });
    entries.push({
      label: "Achievements",
      href: "/admin/event/index?pages=achievements",
      icon: "fas fa-trophy fa-lg",
      match: "/admin/event/index",
      pages: "achievements",
    });
    entries.push({
      label: "Career",
      href: "/admin/admin/careers",
      icon: "fas fa-briefcase fa-lg",
    });
    entries.push({
      label: "Consult",
      href: "/admin/admin/consult",
      icon: "fas fa-briefcase fa-lg",
    });
    entries.push({
      label: "Product",
      icon: "fas fa-boxes fa-lg text-primary",
      match: ["/admin/get_category", "/admin/event/index"],
      items: [
        {
          label: "Category",
          href: "/admin/get_category",
          icon: "fas fa-icons text-danger",
        },
        {
          label: "Product",
          href: "/admin/event/index?pages=products",
          icon: "fas fa-box text-success",
          match: "/admin/event/index",
          pages: "products",
        },
      ],
    });
  }

  return (
    <div id="app">
      <AdminStyles />
      <div className="main-wrapper main-wrapper-1">
        <div className="navbar-bg"></div>
        <nav className="navbar navbar-expand-lg main-navbar">
          <AdminNavbar
            firstName={user.firstName ?? user.fullName}
            fullName={user.fullName}
            imageUrl={await userAvatarUrl(user)}
          />
        </nav>
        <Suspense fallback={<div className="main-sidebar" />}>
          <AdminSidebar
            appName={appName}
            appLogo={appLogo}
            entries={entries}
            hasDashboardHeader={canManageStaff}
          />
        </Suspense>
        <div className="main-content">
          <Flash flash={await readFlash()} />
          {children}
        </div>
        <footer className="main-footer">
          <div className="row mx-0 productFooter">
            <div className="col-md-12">
              {`All rights reserved © ${new Date().getFullYear()} `}
              <a href="/">{appName}</a>
              <span className="float-right version_name">v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
