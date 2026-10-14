"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { AppLogo } from "@/components/app-logo";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  /** Route prefix used for active-state matching (defaults to the href path). */
  match?: string;
  /** Match the full path *and* the `pages` query parameter. */
  pages?: string;
};

export type NavSubmenu = {
  label: string;
  icon: string;
  match: string[];
  items: NavItem[];
};

export type NavEntry = NavItem | NavSubmenu;

type Props = {
  appName: string;
  appLogo: string;
  entries: NavEntry[];
  hasDashboardHeader: boolean;
};

function isSubmenu(entry: NavEntry): entry is NavSubmenu {
  return "items" in entry;
}

function hrefPath(href: string): string {
  return href.split("?")[0];
}

function matchesPath(pathname: string, item: NavItem): boolean {
  const target = hrefPath(item.match ?? item.href);
  return pathname === target || pathname.startsWith(`${target}/`);
}

function isItemActive(
  pathname: string,
  pages: string | null,
  item: NavItem,
): boolean {
  if (!matchesPath(pathname, item)) {
    return false;
  }
  if (item.pages !== undefined) {
    return pages === item.pages;
  }
  return true;
}

export function AdminSidebar({
  appName,
  appLogo,
  entries,
  hasDashboardHeader,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pages = searchParams.get("pages");

  return (
    <div className="main-sidebar">
      <aside id="sidebar-wrapper">
        <div className="sidebar-brand sidebar-sticky sidebar-bottom-padding h-auto line-height-0 padding-bottom-zero">
          <a
            className="navbar-brand d-flex align-items-center justify-content-center py-3 px-2"
            href="/admin/dashboard"
          >
            <AppLogo
              className="navbar-brand-full w-50"
              src={appLogo}
              width={50}
              alt=""
            />
            <span
              style={{ display: "none" }}
              className="navbar-brand-full-name text-black text-wrap pl-2 w-75"
            >
              {appName}
            </span>
          </a>
          <div className="input-group sidebar-search-box">
            <input
              type="text"
              className="form-control searchTerm"
              id="searchText"
              placeholder="Search Menu"
            />
            <div className="input-group-append sGroup">
              <div className="input-group-text">
                <i className="fas fa-search search-sign"></i>
                <i className="fas fa-times close-sign"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar-brand sidebar-brand-sm">
          <a href="/admin/dashboard" className="small text-white">
            <AppLogo className="navbar-brand-full" src={appLogo} width={50} alt="" />
          </a>
        </div>
        <ul className="sidebar-menu">
          {hasDashboardHeader ? (
            <li className="menu-header side-menus">Dashboard</li>
          ) : null}
          {entries.map((entry) => {
            if (isSubmenu(entry)) {
              const active = entry.match.some(
                (prefix) =>
                  pathname === prefix || pathname.startsWith(`${prefix}/`),
              );
              return (
                <li
                  key={entry.label}
                  className={`side-menus has-submenu ${active ? "active" : ""}`}
                >
                  <a className="nav-link" href="#">
                    <i className={entry.icon}></i>
                    <span className="menu-text-wrap">{entry.label}</span>
                    <i className="fas fa-chevron-down submenu-toggle"></i>
                  </a>
                  <ul className="submenu">
                    {entry.items.map((item) => (
                      <li
                        key={item.href}
                        className={
                          isItemActive(pathname, pages, item) ? "active" : ""
                        }
                      >
                        <a className="nav-link" href={item.href}>
                          <i className={item.icon}></i>
                          <span className="menu-text-wrap">{item.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li
                key={entry.href}
                className={`side-menus ${isItemActive(pathname, pages, entry) ? "active" : ""}`}
              >
                <a className="nav-link" href={entry.href}>
                  <i className={entry.icon}></i>
                  <span className="menu-text-wrap">{entry.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
