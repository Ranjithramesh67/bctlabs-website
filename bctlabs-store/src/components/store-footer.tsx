import Link from "next/link";
import type { Category } from "@/lib/store";
import type { StoreSettings } from "@/lib/settings";

export function StoreFooter({ categories, settings }: { categories: Category[]; settings: StoreSettings }) {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-ink-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">B</span>
            <span className="text-lg font-extrabold text-white">{settings.name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{settings.description}</p>
          <p className="mt-4 text-sm text-slate-400">
            <a href={`mailto:${settings.email}`} className="hover:text-white">
              {settings.email}
            </a>
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`} className="text-slate-400 hover:text-white">
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/shop" className="text-slate-400 hover:text-white">
                All products
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about-us" className="text-slate-400 hover:text-white">
                About us
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-slate-400 hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="text-slate-400 hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/order-tracking" className="text-slate-400 hover:text-white">
                Track order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Customer care</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/account" className="text-slate-400 hover:text-white">
                My account
              </Link>
            </li>
            <li>
              <Link href="/account/login" className="text-slate-400 hover:text-white">
                Login / Register
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-slate-400 hover:text-white">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="text-slate-400 hover:text-white">
                Checkout
              </Link>
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-md bg-slate-800 px-2 py-1">GST invoice</span>
            <span className="rounded-md bg-slate-800 px-2 py-1">Secure payments</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>
          <p>
            Prices in INR - {settings.taxLabel} at {settings.taxRate}%
          </p>
        </div>
      </div>
    </footer>
  );
}
