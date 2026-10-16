"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import type { Category } from "@/lib/store";
import { BRAND } from "@/lib/site-content";
import { BrandLogo } from "./brand-logo";
import { IconCart, IconChevronDown, IconClose, IconMail, IconMenu, IconPhone, IconSearch, IconUser } from "./icons";

export function StoreHeader({
  storeName,
  categories,
  cartCount,
  customerName,
}: {
  storeName: string;
  categories: Category[];
  cartCount: number;
  customerName?: string;
}) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = term.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/shop");
    setOpen(false);
  }

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/blog", label: "Blog" },
    { href: "/about-us", label: "About" },
    { href: "/contact-us", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      {/* Utility bar */}
      <div className="bg-ink-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <a href={BRAND.phoneHref} className="flex items-center gap-1.5 hover:text-brand-200">
              <IconPhone className="h-3.5 w-3.5" />
              <span>{BRAND.phone}</span>
            </a>
            <a href={BRAND.emailHref} className="hidden items-center gap-1.5 hover:text-brand-200 sm:flex">
              <IconMail className="h-3.5 w-3.5" />
              <span>{BRAND.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-white/80 md:inline">Free shipping over &#8377;999 &middot; GST invoices</span>
            <Link href="/order-tracking" className="font-semibold text-brand-200 hover:text-white">
              Track order
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        <BrandLogo storeName={storeName} />

        <form onSubmit={submitSearch} className="hidden flex-1 md:block">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <IconSearch className="h-4 w-4" />
            </span>
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search components, boards, sensors..."
              aria-label="Search products"
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href={customerName ? "/account" : "/account/login"}
            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700 sm:flex"
          >
            <IconUser className="h-5 w-5" />
            <span className="max-w-[8rem] truncate">
              {customerName ? customerName.split(" ")[0] : "Login"}
            </span>
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            aria-label={`Cart, ${cartCount} items`}
          >
            <IconCart className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-[11px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Desktop nav with category mega-menu */}
      <nav className="hidden border-t border-slate-100 bg-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 text-sm sm:px-6 lg:px-8">
          <div className="group relative">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-3 font-semibold text-ink-900 group-hover:text-brand-700">
              <IconMenu className="h-4 w-4" />
              All categories
              <IconChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-[38rem] rounded-2xl border border-slate-200 bg-white p-3 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-slate-400">{category.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-lg px-3 py-3 font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700",
                link.href === "/shop" && "font-semibold text-ink-900",
              )}
            >
              {link.label}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-1.5 py-3 text-xs font-semibold text-brand-700">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Same-day dispatch
          </span>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-4">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <IconSearch className="h-4 w-4" />
              </span>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm"
              />
            </div>
          </form>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 font-semibold text-ink-900 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/order-tracking"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 font-semibold text-brand-700 hover:bg-brand-50"
            >
              Track order
            </Link>
            <Link
              href={customerName ? "/account" : "/account/login"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 font-semibold text-ink-900 hover:bg-brand-50"
            >
              {customerName ? "My account" : "Login"}
            </Link>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Categories</p>
          <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
