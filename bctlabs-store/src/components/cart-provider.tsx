"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export type CartLineSnapshot = { productId: number; quantity: number };

type CartContextValue = {
  quantities: Record<number, number>;
  count: number;
  setQuantity: (productId: number, quantity: number) => void;
  applyLines: (lines: CartLineSnapshot[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function toQuantities(lines: CartLineSnapshot[]): Record<number, number> {
  const next: Record<number, number> = {};
  for (const line of lines) {
    if (line.quantity > 0) next[line.productId] = line.quantity;
  }
  return next;
}

function signature(lines: CartLineSnapshot[]): string {
  return [...lines]
    .sort((a, b) => a.productId - b.productId)
    .map((line) => `${line.productId}:${line.quantity}`)
    .join("|");
}

/**
 * Client-side cart mirror so the header badge and every product card update
 * immediately after an add/remove, without a server refresh that would remount
 * the buttons and reset their optimistic state.
 */
export function CartProvider({
  initialLines,
  children,
}: {
  initialLines: CartLineSnapshot[];
  children: React.ReactNode;
}) {
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    toQuantities(initialLines),
  );
  const syncedSignature = useRef(signature(initialLines));

  // Pick up server-side cart changes after a hard navigation or refresh.
  useEffect(() => {
    const nextSignature = signature(initialLines);
    if (nextSignature === syncedSignature.current) return;
    syncedSignature.current = nextSignature;
    setQuantities(toQuantities(initialLines));
  }, [initialLines]);

  function setQuantity(productId: number, quantity: number) {
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity > 0) next[productId] = Math.min(99, quantity);
      else delete next[productId];
      return next;
    });
  }

  function applyLines(lines: CartLineSnapshot[]) {
    syncedSignature.current = signature(lines);
    setQuantities(toQuantities(lines));
  }

  const count = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <CartContext.Provider value={{ quantities, count, setQuantity, applyLines }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
