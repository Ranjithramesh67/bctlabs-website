import Link from "next/link";
import type { Product } from "@/lib/store";
import { formatPrice, formatProductPrice } from "@/lib/format";
import { AddToCartButton } from "./add-to-cart";
import { ProductImage } from "./product-image";
import { Stars } from "./ui";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockStatus === "instock";
  const priced = product.price > 0;
  const discount =
    product.onSale && product.regularPrice > product.price
      ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
      : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/5">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-white"
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full p-5 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 ? (
            <span className="rounded-full bg-accent-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
              -{discount}%
            </span>
          ) : null}
          {!inStock ? (
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Out of stock
            </span>
          ) : null}
        </div>
        {product.totalSales > 0 ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
            Bestseller
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.categories[0] ? (
          <Link
            href={`/category/${product.categories[0].slug}`}
            className="text-[11px] font-bold uppercase tracking-wider text-brand-600 hover:text-brand-800"
          >
            {product.categories[0].name}
          </Link>
        ) : null}

        <Link
          href={`/product/${product.slug}`}
          className="mt-1.5 line-clamp-2 font-semibold leading-snug text-ink-900 transition-colors hover:text-brand-700"
        >
          {product.name}
        </Link>

        <div className="mt-1.5">
          <Stars rating={product.rating || 4.5} count={product.reviewCount || undefined} />
        </div>

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-extrabold text-ink-900">{formatProductPrice(product.price)}</span>
            {priced && product.onSale && product.regularPrice > product.price ? (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
            {inStock ? "In stock, ready to ship" : "Currently unavailable"}
          </p>
          <div className="mt-3">
            {priced ? (
              <AddToCartButton
                productId={product.id}
                inStock={inStock}
                label={inStock ? "Add to cart" : "Notify me"}
                variant="primary"
                className="w-full"
              />
            ) : (
              <Link
                href="/contact-us"
                className="flex w-full items-center justify-center rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                Enquire for price
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
