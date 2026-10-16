"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/store";

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

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = term.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="bg-ink-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
          <span>Free shipping on orders over Rs 999</span>
          <span className="hidden sm:inline">Genuine components - Fast dispatch - GST invoices</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">
            B
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">{storeName}</span>
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 md:flex">
          <div className="relative w-full">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search components, boards, sensors..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={customerName ? "/account" : "/account/login"}
            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:flex"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
            </svg>
            {customerName ? customerName.split(" ")[0] : "Login"}
          </Link>
          <Link href="/cart" className="relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M6 6 5 3H2" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-slate-100 bg-white md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 text-sm sm:px-6 lg:px-8">
          <Link href="/shop" className="rounded-lg px-3 py-2.5 font-semibold text-slate-800 hover:bg-brand-50 hover:text-brand-700">
            All products
          </Link>
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-lg px-3 py-2.5 font-medium text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-700">
              Categories
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-[30rem] rounded-2xl border border-slate-200 bg-white p-3 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-1">
                {categories.slice(0, 14).map((category) => (
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
          <Link href="/blog" className="rounded-lg px-3 py-2.5 font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700">
            Blog
          </Link>
          <Link href="/about-us" className="rounded-lg px-3 py-2.5 font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700">
            About
          </Link>
          <Link href="/contact-us" className="rounded-lg px-3 py-2.5 font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700">
            Contact
          </Link>
          <Link href="/order-tracking" className="ml-auto rounded-lg px-3 py-2.5 font-medium text-brand-700 hover:bg-brand-50">
            Track order
          </Link>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm"
            />
          </form>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <Link href="/shop" className="rounded-lg px-3 py-2 font-semibold text-slate-800 hover:bg-slate-100" onClick={() => setOpen(false)}>
              All products
            </Link>
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link href="/blog" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Blog
            </Link>
            <Link href="/about-us" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link href="/contact-us" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Contact
            </Link>
            <Link href="/order-tracking" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Track order
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
