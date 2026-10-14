"use client";

import { useRef } from "react";

import { NotificationBell } from "@/components/admin/notification-bell";
import { useDropdown } from "@/components/admin/use-dropdown";
import { t } from "@/lib/i18n";

type Props = {
  firstName: string;
  fullName: string;
  imageUrl: string;
  /** Opens/closes the off-canvas sidebar on small screens. */
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
};

export function AdminNavbar({
  firstName,
  fullName,
  imageUrl,
  onToggleSidebar,
  sidebarOpen,
}: Props) {
  const userMenuRef = useRef<HTMLLIElement>(null);
  const userMenu = useDropdown(userMenuRef);

  return (
    <>
      <form className="form-inline mr-auto" action="#">
        <ul className="navbar-nav mr-3">
          <li>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="nav-link nav-link-lg admin-sidebar-toggle border-0 bg-transparent d-lg-none"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <i className="fas fa-bars"></i>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="nav-link nav-link-lg d-none border-0 bg-transparent"
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
          </li>
        </ul>
        <div className="search-element">
          <input
            className="form-control search-input-css"
            type="text"
            id="searchCustomer"
            disabled
            placeholder={t("common.search")}
            aria-label="Search"
            autoComplete="off"
          />
          <button className="form-control btn" type="submit">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </form>
      <NotificationBell />
      <ul className="navbar-nav navbar-right">
        <li className={`dropdown ${userMenu.open ? "show" : ""}`} ref={userMenuRef}>
          <a
            href="#"
            className="nav-link dropdown-toggle nav-link-lg nav-link-user"
            aria-haspopup="true"
            aria-expanded={userMenu.open}
            onClick={(event) => {
              event.preventDefault();
              userMenu.toggle();
            }}
          >
            <img
              alt=""
              width={50}
              id="loginUserImage"
              src={imageUrl}
              className="rounded-circle user-avatar-image"
            />
            <div className="d-sm-none d-lg-inline-block">
              {t("edit_profile.hi")}, {firstName}
            </div>
          </a>
          <div
            className={`dropdown-menu dropdown-menu-right ${userMenu.open ? "show" : ""}`}
          >
            <div className="dropdown-title">
              {t("edit_profile.welcome")}, {fullName}
            </div>
            <a href="/admin/profile" className="dropdown-item has-icon">
              <i className="far fa-user mr-2"></i>
              {t("edit_profile.edit_profile")}
            </a>
            <a
              className="dropdown-item has-icon"
              href="/admin/profile#change-password"
            >
              <i className="fa fa-lock mr-2"></i>
              <div className="change-pass-wrap">
                {t("edit_profile.change_password")}
              </div>
            </a>
            <a
              className="dropdown-item"
              href="/admin/profile#change-language"
            >
              <i className="fa fa-language mr-2"></i>
              {t("user.change_language")}
            </a>
            <div className="dropdown-divider"></div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="dropdown-item has-icon text-danger border-0 bg-transparent w-100 text-left"
              >
                <i className="fas fa-sign-out-alt"></i>{" "}
                {t("edit_profile.logout")}
              </button>
            </form>
          </div>
        </li>
      </ul>
    </>
  );
}
