"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useDropdown } from "@/components/admin/use-dropdown";
import { t } from "@/lib/i18n";

type Notification = {
  id: number;
  title: string | null;
  type: string | null;
  description: string | null;
  created_at: string | null;
};

/** Port of `HeaderNotificationIconJS()` from `notification.js`. */
function headerNotificationIcon(type: string | null): string {
  const className = (type ?? "").substring(11);
  if (className === "Project") {
    return "fas fa-folder-open";
  }
  if (className === "Task") {
    return "fas fa-tasks";
  }
  if (className === "Invoice") {
    return "fas fa-file-invoice";
  }
  if (className === "User") {
    return "fas fa-users";
  }
  return "fas fa-bell";
}

/** Approximation of `moment($date).fromNow()`. */
function diffForHumans(value: string | null): string {
  if (!value) {
    return "";
  }
  const diff = Date.now() - new Date(value).getTime();
  const future = diff < 0;
  const seconds = Math.max(0, Math.floor(Math.abs(diff) / 1000));

  const units: Array<[number, number, string]> = [
    [60, 1, "second"],
    [60, 60, "minute"],
    [24, 3600, "hour"],
    [7, 86400, "day"],
    [4, 604800, "week"],
    [12, 2629746, "month"],
    [Number.POSITIVE_INFINITY, 31556952, "year"],
  ];

  let amount = 0;
  let unit = "second";
  for (const [limit, divisor, name] of units) {
    if (seconds / divisor < limit) {
      amount = Math.max(1, Math.round(seconds / divisor));
      unit = name;
      break;
    }
  }

  const label = `${amount} ${unit}${amount === 1 ? "" : "s"}`;
  return future ? `in ${label}` : `${label} ago`;
}

/**
 * Admin header notification dropdown. Reproduces the markup from
 * `layouts/header.blade.php` and the item template from `notification.js`,
 * backed by the original `GET /get-notifications` endpoint.
 */
export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const menuRef = useRef<HTMLLIElement>(null);
  const menu = useDropdown(menuRef);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/get-notifications", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          success?: boolean;
          data?: Notification[];
        };
        if (active && payload.success) {
          setNotifications(payload.data ?? []);
        }
      } catch {
        // Keep the last known list on transient errors.
      }
    };

    void load();
    const timer = setInterval(() => void load(), 120000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const unreadCount = notifications.length;

  const handleRead = async (id: number, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setNotifications((current) => current.filter((item) => item.id !== id));
    try {
      await fetch(`/notification/${id}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ notificationId: String(id) }),
      });
    } catch {
      // Ignore transient errors; the next poll reconciles the list.
    }
  };

  const handleReadAll = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setNotifications([]);
    try {
      await fetch("/read-all-notification", { method: "POST" });
    } catch {
      // Ignore transient errors; the next poll reconciles the list.
    }
  };

  return (
    <ul className="navbar-nav navbar-right">
      <li
        className={`dropdown dropdown-list-toggle ${menu.open ? "show" : ""}`}
        ref={menuRef}
      >
        <a
          href="#"
          className={`nav-link notification-toggle nav-link-lg${
            unreadCount > 0 ? " beep" : ""
          }`}
          title={t("notification.notifications")}
          aria-haspopup="true"
          aria-expanded={menu.open}
          onClick={(event) => {
            event.preventDefault();
            menu.toggle();
          }}
        >
          <i className="far fa-bell"></i>
        </a>
        <div
          className={`dropdown-menu dropdown-list dropdown-menu-right ${menu.open ? "show" : ""}`}
          id="notification"
        >
          <div className="dropdown-header">
            <div className="row justify-content-between">
              <div className="px-3">{t("notification.notifications")}</div>
              <div
                className={`px-3${unreadCount === 0 ? " d-none" : ""}`}
                id="allRead"
              >
                <a
                  href="#"
                  className="text-decoration-none"
                  onClick={handleReadAll}
                >
                  {t("notification.mark_all_as_read")}
                </a>
              </div>
            </div>
          </div>
          <div
            className="dropdown-list-content dropdown-list-icons notification-content"
            style={{ overflowY: "auto" }}
          >
            <div
              className={`empty-state empty-notification${
                unreadCount > 0 ? " d-none" : ""
              }`}
              data-height="300"
              style={{ padding: "0px 40px" }}
            >
              <div className="empty-state-icon">
                <i className="fas fa-question mt-4"></i>
              </div>
              <h2>{t("notification.empty_notifications")}</h2>
            </div>
            {notifications.map((notification) => (
              <a
                key={notification.id}
                href="#"
                data-id={notification.id}
                className="dropdown-item dropdown-item-unread readNotification"
                id="readNotification"
                onClick={(event) => void handleRead(notification.id, event)}
              >
                <div className="dropdown-item-icon bg-primary text-white">
                  <i
                    className={headerNotificationIcon(notification.type)}
                    style={{ lineHeight: "unset" }}
                  ></i>
                </div>
                <div
                  className="dropdown-item-desc text-dark notification-title"
                  style={{ width: "100%" }}
                >
                  {notification.title}
                  <div className="">
                    <span
                      className="notification-for-text"
                      style={{ lineBreak: "anywhere", color: "grey" }}
                    >
                      {notification.description}
                    </span>
                  </div>
                  <div className="float-right">
                    <small className="notification-time">
                      {diffForHumans(notification.created_at)}
                    </small>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </li>
    </ul>
  );
}
