"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "./ui";

export function AddToCartButton({
  productId,
  inStock,
  quantity = 1,
  label = "Add to cart",
  variant = "primary",
  className,
}: {
  productId: number;
  inStock: boolean;
  quantity?: number;
  label?: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  async function add() {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (response.ok) {
      setAdded(true);
      startTransition(() => router.refresh());
      setTimeout(() => setAdded(false), 2000);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      disabled={!inStock || isPending}
      onClick={add}
      className={`w-full ${className ?? ""}`}
    >
      {!inStock ? "Out of stock" : added ? "Added" : isPending ? "Adding..." : label}
    </Button>
  );
}
