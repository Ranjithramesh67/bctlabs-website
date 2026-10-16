"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";

const LINKS = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/cart", label: "Cart" },
  { href: "/shop", label: "Continue shopping" },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <nav className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <ul className="space-y-1">
        {LINKS.map((link) => {
          const active = link.href === "/account" ? pathname === "/account" : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  "block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
