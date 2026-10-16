"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ButtonLink, Card, EmptyState } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import type { CartItem, CartTotals } from "@/lib/pricing";

export function CartView({
  items,
  totals,
  taxLabel,
}: {
  items: CartItem[];
  totals: CartTotals;
  taxLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const pending = busyId !== null || isPending;

  async function setQuantity(productId: number, quantity: number) {
    if (pending) return;
    setBusyId(productId);
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (response.ok) startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(productId: number) {
    if (pending) return;
    setBusyId(productId);
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      if (response.ok) startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Explore our components, boards and kits."
        action={<ButtonLink href="/shop">Browse the shop</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {totals.count} {totals.count === 1 ? "item" : "items"}
          </h2>
          <Link href="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            Continue shopping
          </Link>
        </div>

        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="block h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image ?? "/media/woocommerce-placeholder.webp"}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-2"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="line-clamp-2 font-semibold text-slate-800 hover:text-brand-700"
                  >
                    {item.name}
                  </Link>
                  {item.sku ? <p className="mt-0.5 text-xs text-slate-400">SKU: {item.sku}</p> : null}
                  <p className="mt-1 text-sm text-slate-500 sm:hidden">
                    {formatPrice(item.price)} each
                  </p>
                  {item.stockStatus !== "instock" ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">Out of stock</p>
                  ) : null}
                </div>

                <div className="hidden w-24 text-right text-sm text-slate-500 sm:block">
                  {formatPrice(item.price)}
                </div>

                <div className="flex items-center justify-between gap-4 sm:contents">
                  <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      disabled={pending || item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-l-xl text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      &minus;
                    </button>
                    <span className="w-10 text-center text-sm font-semibold tabular-nums text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      disabled={pending || item.quantity >= 99}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-r-xl text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-24 text-right font-semibold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={pending}
                    aria-label={`Remove ${item.name} from cart`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="font-medium text-slate-900">{formatPrice(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 ? (
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Discount</dt>
              <dd className="font-medium text-emerald-600">-{formatPrice(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">{taxLabel}</dt>
            <dd className="font-medium text-slate-900">{formatPrice(totals.tax)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Shipping</dt>
            <dd className="font-medium text-slate-900">
              {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-base font-semibold text-slate-900">Total</span>
          <span className="text-xl font-bold text-slate-900">{formatPrice(totals.total)}</span>
        </div>
        <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">
          Proceed to checkout
        </ButtonLink>
        <Link
          href="/shop"
          className="mt-3 block text-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Continue shopping
        </Link>
      </Card>
    </div>
  );
}
