import Link from "next/link";
import type { Category } from "@/lib/store";
import type { StoreSettings } from "@/lib/settings";
import { BRAND, PAYMENT_BADGES } from "@/lib/site-content";
import { BrandLogo } from "./brand-logo";
import { IconClock, IconMail, IconMapPin, IconPhone, IconRefresh, IconShield, IconTruck, SocialIcon } from "./icons";

const TRUST_STRIP = [
  { icon: IconTruck, title: "Fast dispatch", text: "Same-day on orders before 3 PM" },
  { icon: IconShield, title: "Genuine parts", text: "Tested before every dispatch" },
  { icon: IconRefresh, title: "7-day returns", text: "Unused items, original packaging" },
  { icon: IconMail, title: "Real support", text: "Maker help from our engineers" },
];

export function StoreFooter({ categories, settings }: { categories: Category[]; settings: StoreSettings }) {
  return (
    <footer className="mt-20 bg-ink-900 text-slate-300">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST_STRIP.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-200">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-400">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <BrandLogo storeName={settings.name} variant="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
            {settings.description}
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <p className="flex items-start gap-2.5 text-slate-400">
              <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <span>
                {BRAND.address.line1}, {BRAND.address.line2}
                <br />
                {BRAND.address.city} - {BRAND.address.postcode}, {BRAND.address.state}
              </span>
            </p>
            <a href={BRAND.phoneHref} className="flex items-center gap-2.5 text-slate-400 hover:text-white">
              <IconPhone className="h-4 w-4 shrink-0 text-brand-300" />
              {BRAND.phone}
            </a>
            <a href={BRAND.emailHref} className="flex items-center gap-2.5 text-slate-400 hover:text-white">
              <IconMail className="h-4 w-4 shrink-0 text-brand-300" />
              {BRAND.email}
            </a>
            <p className="flex items-center gap-2.5 text-slate-400">
              <IconClock className="h-4 w-4 shrink-0 text-brand-300" />
              {BRAND.hours}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {BRAND.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition-colors hover:bg-brand-600 hover:text-white"
              >
                <SocialIcon name={social.icon} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.slice(0, 7).map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`} className="text-slate-400 hover:text-white">
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/shop" className="font-semibold text-brand-200 hover:text-white">
                All products
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
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
            <li>
              <Link href="/shop?onSale=1" className="text-slate-400 hover:text-white">
                Deals
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Help</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/account" className="text-slate-400 hover:text-white">
                My account
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
            <li>
              <Link href="/shipping-returns" className="text-slate-400 hover:text-white">
                Shipping &amp; returns
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">We accept</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {PAYMENT_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200"
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">Need help?</p>
            <a href={BRAND.phoneHref} className="mt-1 block text-sm font-bold text-white hover:text-brand-200">
              {BRAND.phone}
            </a>
            <p className="text-xs text-slate-400">{BRAND.hours}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>Since {BRAND.founded}</span>
            <span className="text-slate-700">&middot;</span>
            <span>
              Prices in {settings.currency} &middot; {settings.taxLabel} at {settings.taxRate}%
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
