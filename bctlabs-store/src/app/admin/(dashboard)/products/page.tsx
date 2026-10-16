import type { Metadata } from "next";
import Link from "next/link";

import { Badge, Button, Card, Container, EmptyState, Input } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getProducts, type Product } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Products" };

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

function stockMeta(product: Product): { label: string; tone: "green" | "amber" | "red" } {
  if (product.stockStatus === "instock") return { label: "In stock", tone: "green" };
  if (product.stockStatus === "onbackorder") return { label: "On backorder", tone: "amber" };
  return { label: "Out of stock", tone: "red" };
}

function pageHref(q: string | undefined, page: number): string {
  const search = new URLSearchParams();
  if (q) search.set("q", q);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = firstValue(sp.q)?.trim() || undefined;
  const page = parsePage(firstValue(sp.page));

  const result = await getProducts({ search: q, page, perPage: 20, sort: "newest" });

  const start = (result.page - 1) * result.perPage + 1;
  const end = start + result.items.length - 1;
  const hasPrev = result.page > 1;
  const hasNext = result.page < result.pages;

  return (
    <Container className="py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Products</h1>
          <p className="mt-2 text-sm text-slate-500">
            {result.total} product{result.total === 1 ? "" : "s"}
            {q ? ` matching "${q}"` : ""}
          </p>
        </div>
        <form method="get" action="/admin/products" className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products"
            aria-label="Search products"
            className="sm:w-64"
          />
          <Button type="submit" size="sm" className="shrink-0">
            Apply
          </Button>
        </form>
      </header>

      {result.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No products found"
            description={q ? `Nothing matches "${q}". Try a different search.` : "There are no products to show yet."}
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">
            Showing {start}-{end} of {result.total}
          </p>

          <Card className="mt-3 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">Product</th>
                    <th scope="col" className="px-4 py-3">SKU</th>
                    <th scope="col" className="px-4 py-3">Price</th>
                    <th scope="col" className="px-4 py-3">Stock</th>
                    <th scope="col" className="px-4 py-3">Categories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {result.items.map((product) => {
                    const stock = stockMeta(product);
                    return (
                      <tr key={product.id} className="align-middle hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-slate-100" aria-hidden="true" />
                            )}
                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-slate-800 hover:text-brand-700"
                            >
                              {product.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{product.sku || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900">{formatPrice(product.price)}</span>
                          {product.onSale && product.regularPrice > product.price ? (
                            <span className="ml-2 text-xs text-slate-400 line-through">
                              {formatPrice(product.regularPrice)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={stock.tone}>{stock.label}</Badge>
                          {product.stockQuantity !== null ? (
                            <span className="ml-2 text-xs text-slate-400">{product.stockQuantity} in stock</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {product.categories.length > 0
                            ? product.categories.slice(0, 2).map((c) => c.name).join(", ")
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {result.pages > 1 ? (
            <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Pagination">
              {hasPrev ? (
                <Link
                  href={pageHref(q, result.page - 1)}
                  rel="prev"
                  className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400">
                  Previous
                </span>
              )}
              <span className="text-sm text-slate-500">
                Page {result.page} of {result.pages}
              </span>
              {hasNext ? (
                <Link
                  href={pageHref(q, result.page + 1)}
                  rel="next"
                  className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400">
                  Next
                </span>
              )}
            </nav>
          ) : null}
        </>
      )}
    </Container>
  );
}
