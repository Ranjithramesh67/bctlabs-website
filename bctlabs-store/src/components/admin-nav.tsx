"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { clsx } from "clsx";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-[18px] w-[18px] flex-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function DashboardIcon() {
  return (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

function OrdersIcon() {
  return (
    <Icon>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="3.5" cy="6" r="1" />
      <circle cx="3.5" cy="12" r="1" />
      <circle cx="3.5" cy="18" r="1" />
    </Icon>
  );
}

function ProductsIcon() {
  return (
    <Icon>
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </Icon>
  );
}

function CustomersIcon() {
  return (
    <Icon>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.2 2.7-5 6-5s6 1.8 6 5" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6.4" />
      <path d="M18 15.4c2 .7 3 2.2 3 4.6" />
    </Icon>
  );
}

function MessagesIcon() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Icon>
  );
}

function LogisticsIcon() {
  return (
    <Icon>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </Icon>
  );
}

function SignOutIcon() {
  return (
    <Icon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

type NavLink = { href: string; label: string; Icon: ComponentType };

const LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard", Icon: DashboardIcon },
  { href: "/admin/orders", label: "Orders", Icon: OrdersIcon },
  { href: "/admin/logistics", label: "Logistics", Icon: LogisticsIcon },
  { href: "/admin/products", label: "Products", Icon: ProductsIcon },
  { href: "/admin/customers", label: "Customers", Icon: CustomersIcon },
  { href: "/admin/messages", label: "Messages", Icon: MessagesIcon },
];

/**
 * Signs the staff user out and returns them to the login screen.
 * Shared between the sidebar and the top bar so the behaviour lives in one place.
 */
export function AdminSignOutButton({ className, label = "Sign out" }: { className?: string; label?: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={signingOut}
      className={clsx("disabled:cursor-not-allowed disabled:opacity-60", className)}
    >
      <SignOutIcon />
      {signingOut ? "Signing out..." : label}
    </button>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="lg:flex lg:h-full lg:flex-col lg:p-3">
      <ul className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:py-0">
        {LINKS.map(({ href, label, Icon: ItemIcon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <ItemIcon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden lg:mt-auto lg:block lg:border-t lg:border-slate-100 lg:pt-3">
        <AdminSignOutButton className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50" />
      </div>
    </nav>
  );
}
