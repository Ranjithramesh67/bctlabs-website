import Link from "next/link";
import type { Metadata } from "next";

import { ButtonLink, Container } from "@/components/ui";
import { BRAND } from "@/lib/site-content";
import { formatPrice } from "@/lib/format";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "Dispatch times, delivery estimates and the returns policy for BCTLABS electronic component orders.",
};

export default async function ShippingReturnsPage() {
  const settings = await getStoreSettings();

  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-brand-700">
          Home
        </Link>
        <span aria-hidden="true" className="text-slate-300">
          /
        </span>
        <span aria-current="page" className="font-medium text-slate-900">
          Shipping &amp; returns
        </span>
      </nav>

      <article className="mx-auto mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Shipping &amp; returns
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          We dispatch orders quickly and pack components carefully so your parts arrive ready to
          build. Below is everything you need to know about delivery and returns.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Dispatch times</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          Orders placed before 3 PM on a working day leave our warehouse the same day. Orders placed
          later, on a weekend or on a public holiday are dispatched the next working day. You will
          receive tracking details by email as soon as your parcel is handed to the courier.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Delivery charges</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-[15px] leading-relaxed text-slate-600">
          <li>
            Free shipping on orders above {formatPrice(settings.freeShippingMin)}.
          </li>
          <li>
            A flat delivery charge applies to smaller orders and is shown clearly at checkout before
            you pay.
          </li>
          <li>We deliver across India; delivery usually takes 2 to 7 working days.</li>
        </ul>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Returns and replacements</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          Unused items in their original packaging can be returned within 7 days of delivery. If a
          component arrives damaged, faulty or different from what you ordered, contact us and we
          will arrange a replacement or a refund.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          To start a return, email{" "}
          <a
            href={BRAND.emailHref}
            className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
          >
            {BRAND.email}
          </a>{" "}
          or call {BRAND.phone} with your order number. We are available {BRAND.hours}.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <ButtonLink href="/contact-us">Contact support</ButtonLink>
          <ButtonLink href="/order-tracking" variant="outline">
            Track an order
          </ButtonLink>
        </div>
      </article>
    </Container>
  );
}
