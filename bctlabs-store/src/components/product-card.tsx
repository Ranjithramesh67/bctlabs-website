import Link from "next/link";
import type { Product } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "./add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image ?? "/media/woocommerce-placeholder.webp"}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />
        {product.onSale ? (
          <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
            Sale
          </span>
        ) : null}
        {product.stockStatus !== "instock" ? (
          <span className="absolute right-3 top-3 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
            Out of stock
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {product.categories[0] ? (
          <Link href={`/category/${product.categories[0].slug}`} className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {product.categories[0].name}
          </Link>
        ) : null}
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 font-semibold leading-snug text-slate-800 hover:text-brand-700">
          {product.name}
        </Link>
        {product.sku ? <p className="mt-1 text-xs text-slate-400">SKU: {product.sku}</p> : null}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
            {product.salePrice && product.regularPrice > product.salePrice ? (
              <span className="ml-2 text-sm text-slate-400 line-through">{formatPrice(product.regularPrice)}</span>
            ) : null}
          </div>
        </div>
        <div className="mt-4">
          <AddToCartButton productId={product.id} inStock={product.stockStatus === "instock"} />
        </div>
      </div>
    </div>
  );
}
