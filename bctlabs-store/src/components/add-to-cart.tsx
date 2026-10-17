"use client";

import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { Button } from "./ui";
import { useCart } from "./cart-provider";

type CartResponse = {
  count?: number;
  lines?: { productId: number; quantity: number }[];
};

export function AddToCartButton({
  productId,
  inStock,
  quantity = 1,
  label = "Add to cart",
  variant = "primary",
  className,
  showCount = true,
}: {
  productId: number;
  inStock: boolean;
  quantity?: number;
  label?: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  /** Replace the button with a quantity stepper once the item is in the cart. */
  showCount?: boolean;
}) {
  const { quantities, setQuantity, applyLines } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const inCart = quantities[productId] ?? 0;

  async function update(nextQuantity: number) {
    setBusy(true);
    setError(false);
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: nextQuantity }),
      });
      if (!response.ok) throw new Error("cart update failed");
      const data = (await response.json().catch(() => null)) as CartResponse | null;
      if (data?.lines) applyLines(data.lines);
      else setQuantity(productId, nextQuantity);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    setBusy(true);
    setError(false);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error("cart add failed");
      const data = (await response.json().catch(() => null)) as CartResponse | null;
      if (data?.lines) applyLines(data.lines);
      else setQuantity(productId, (quantities[productId] ?? 0) + quantity);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!inStock) {
    return (
      <Button type="button" variant={variant} disabled className={clsx("w-full", className)}>
        Out of stock
      </Button>
    );
  }

  if (showCount && inCart > 0) {
    return (
      <div className={clsx("w-full", className)}>
        <div className="flex w-full items-center justify-between overflow-hidden rounded-xl border border-brand-300 bg-brand-50">
          <button
            type="button"
            onClick={() => update(inCart - 1)}
            disabled={busy}
            aria-label={`Decrease quantity of this item in cart`}
            className="flex h-10 w-10 items-center justify-center text-lg font-bold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &minus;
          </button>
          <Link
            href="/cart"
            className="flex-1 text-center text-sm font-bold text-brand-800 hover:underline"
          >
            {inCart} in cart
          </Link>
          <button
            type="button"
            onClick={() => update(inCart + 1)}
            disabled={busy || inCart >= 99}
            aria-label={`Increase quantity of this item in cart`}
            className="flex h-10 w-10 items-center justify-center text-lg font-bold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
        {error ? <p className="mt-1 text-[11px] font-medium text-rose-600">Could not update the cart. Try again.</p> : null}
      </div>
    );
  }

  return (
    <div className={clsx("w-full", className)}>
      <Button
        type="button"
        variant={variant}
        disabled={busy}
        onClick={add}
        className="w-full"
      >
        {busy ? "Adding..." : inCart > 0 ? `${inCart} in cart - add another` : label}
      </Button>
      {error ? <p className="mt-1 text-[11px] font-medium text-rose-600">Could not add to cart. Try again.</p> : null}
    </div>
  );
}
