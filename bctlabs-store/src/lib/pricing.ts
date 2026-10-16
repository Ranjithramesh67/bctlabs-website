import "server-only";

import type { Product } from "./store";
import type { StoreSettings } from "./settings";

export type CartItem = Product & { quantity: number };

export type CartTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  count: number;
};

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeTotals(items: CartItem[], settings: StoreSettings, discount = 0): CartTotals {
  const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const taxable = Math.max(0, subtotal - discount);

  let tax: number;
  if (settings.taxMode === "inclusive") {
    tax = round2(taxable - taxable / (1 + settings.taxRate / 100));
  } else {
    tax = round2((taxable * settings.taxRate) / 100);
  }

  const shipping = taxable >= settings.freeShippingMin ? 0 : items.length ? settings.flatRate : 0;
  const total = round2(taxable + tax + shipping);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { subtotal, discount, tax, shipping, total, count };
}
