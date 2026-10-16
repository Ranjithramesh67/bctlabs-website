"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice, truncate } from "@/lib/format";
import { AddToCartButton } from "./add-to-cart";
import { Badge, ButtonLink } from "./ui";

/** Only the plain, serialisable product fields the summary needs. */
export type ProductDetailsProduct = {
  id: number;
  name: string;
  sku: string;
  excerpt: string;
  description: string;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  onSale: boolean;
  stockStatus: string;
  stockQuantity: number | null;
  rating: number;
  reviewCount: number;
  categories: { name: string; slug: string }[];
};

const STAR_PATH =
  "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function Star({ fill }: { fill: "full" | "half" | "empty" }) {
  return (
    <span className="relative inline-block h-4 w-4" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-300" fill="currentColor">
        <path d={STAR_PATH} />
      </svg>
      {fill !== "empty" ? (
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: fill === "half" ? "50%" : "100%" }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-400" fill="currentColor">
            <path d={STAR_PATH} />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-2" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            fill={rounded >= star ? "full" : rounded >= star - 0.5 ? "half" : "empty"}
          />
        ))}
      </div>
      <span className="text-sm text-slate-500">
        {rating.toFixed(1)}
        {reviewCount > 0
          ? ` (${reviewCount} review${reviewCount === 1 ? "" : "s"})`
          : " (no reviews yet)"}
      </span>
    </div>
  );
}

export function ProductDetails({ product }: { product: ProductDetailsProduct }) {
  const [quantity, setQuantity] = useState(1);

  const inStock = product.stockStatus === "instock";
  const onBackorder = product.stockStatus === "onbackorder";
  const maxQuantity =
    product.stockQuantity && product.stockQuantity > 0 ? product.stockQuantity : undefined;

  const clamp = (value: number) =>
    Math.min(Math.max(1, Math.floor(value) || 1), maxQuantity ?? 99);

  const salePrice =
    product.onSale && product.salePrice !== null && product.regularPrice > product.salePrice
      ? product.salePrice
      : null;
  const displayPrice = salePrice ?? product.price;
  const discount =
    salePrice !== null && product.regularPrice > 0
      ? Math.round((1 - salePrice / product.regularPrice) * 100)
      : 0;

  const excerpt = truncate(product.excerpt || product.description, 220);

  return (
    <div className="flex flex-col">
      {product.categories.length ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {product.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-brand-600 hover:text-brand-700"
            >
              {category.name}
            </Link>
          ))}
        </div>
      ) : null}

      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        {product.sku ? <span className="text-sm text-slate-400">SKU: {product.sku}</span> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-black text-slate-900">{formatPrice(displayPrice)}</span>
        {salePrice !== null ? (
          <>
            <span className="text-lg text-slate-400 line-through">
              {formatPrice(product.regularPrice)}
            </span>
            {discount > 0 ? <Badge tone="red">{discount}% off</Badge> : null}
          </>
        ) : null}
      </div>

      <div className="mt-3">
        {inStock ? (
          <Badge tone="green">
            In stock
            {product.stockQuantity && product.stockQuantity > 0
              ? ` - ${product.stockQuantity} available`
              : ""}
          </Badge>
        ) : onBackorder ? (
          <Badge tone="amber">Available on backorder</Badge>
        ) : (
          <Badge tone="red">Out of stock</Badge>
        )}
      </div>

      {excerpt ? <p className="mt-5 text-sm leading-relaxed text-slate-600">{excerpt}</p> : null}

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Quantity</span>
          <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => clamp(q - 1))}
              disabled={!inStock || quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-10 w-10 items-center justify-center rounded-l-xl text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              -
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={maxQuantity}
              value={quantity}
              disabled={!inStock}
              onChange={(event) => setQuantity((q) => clamp(Number(event.target.value) || q))}
              aria-label="Quantity"
              className="h-10 w-14 border-x border-slate-200 bg-white text-center text-sm font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => clamp(q + 1))}
              disabled={!inStock || (maxQuantity !== undefined && quantity >= maxQuantity)}
              aria-label="Increase quantity"
              className="flex h-10 w-10 items-center justify-center rounded-r-xl text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        <AddToCartButton productId={product.id} inStock={inStock} quantity={quantity} />
        <ButtonLink href="/cart" variant="outline" className="w-full">
          View cart
        </ButtonLink>
      </div>
    </div>
  );
}
