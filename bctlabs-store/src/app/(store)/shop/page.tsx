import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop-filters";
import { Pagination, type ShopParams } from "@/components/pagination";
import { Container, EmptyState } from "@/components/ui";
import { getCategories, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const SORTS = ["newest", "price-asc", "price-desc", "popular", "rating"] as const;
type Sort = (typeof SORTS)[number];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSort(value: string | undefined): Sort | undefined {
  return SORTS.find((sort) => sort === value);
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

function isFlag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = firstValue(sp.q)?.trim();
  return { title: q ? `${q} - Shop` : "Shop" };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const q = firstValue(sp.q)?.trim() || undefined;
  const category = firstValue(sp.category)?.trim() || undefined;
  const sort = parseSort(firstValue(sp.sort));
  const page = parsePage(firstValue(sp.page));
  // The home page links `?onSale=1`; accept it alongside the canonical `sale` param.
  const onSale = isFlag(firstValue(sp.sale)) || isFlag(firstValue(sp.onSale));
  const inStock = isFlag(firstValue(sp.stock));

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: category,
      search: q,
      sort,
      page,
      perPage: 12,
      onSale,
      inStock,
    }),
  ]);

  const params: ShopParams = {};
  if (q) params.q = q;
  if (category) params.category = category;
  if (sort) params.sort = sort;
  if (onSale) params.sale = "1";
  if (inStock) params.stock = "1";

  const activeCategory = category ? categories.find((c) => c.slug === category) : undefined;
  const hasItems = result.items.length > 0;
  const start = (result.page - 1) * result.perPage + 1;
  const end = start + result.items.length - 1;

  return (
    <Container className="py-10">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Shop</h1>
        <p className="mt-2 text-sm text-slate-500">
          {result.total} product{result.total === 1 ? "" : "s"}
          {q ? ` matching "${q}"` : ""}
          {activeCategory ? ` in ${activeCategory.name}` : ""}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <ShopFilters
            categories={categories}
            query={{ q, category, sort: sort ?? "newest", onSale, inStock }}
          />
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500">
              {hasItems ? `Showing ${start}-${end} of ${result.total}` : "No products to show"}
            </p>
            {onSale || inStock ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {[onSale ? "On sale" : null, inStock ? "In stock" : null].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>

          {hasItems ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products found"
              description="Try a different search or filter."
            />
          )}

          <Pagination page={result.page} pages={result.pages} params={params} />
        </section>
      </div>
    </Container>
  );
}
