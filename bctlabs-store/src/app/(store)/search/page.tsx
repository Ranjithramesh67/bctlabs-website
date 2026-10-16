import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SearchBox } from "@/components/search-box";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

function searchHref(q: string, page: number): string {
  const params = new URLSearchParams({ q });
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

const GAP = "...";

/** Compact set of page numbers with ellipsis gaps, mirroring the shop pagination. */
function pageItems(page: number, pages: number): (number | typeof GAP)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const items: (number | typeof GAP)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);

  if (start > 2) items.push(GAP);
  for (let n = start; n <= end; n += 1) items.push(n);
  if (end < pages - 1) items.push(GAP);
  items.push(pages);

  return items;
}

const PAGE_BASE =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors";

function SearchPagination({ q, page, pages }: { q: string; page: number; pages: number }) {
  if (pages <= 1) return null;

  const current = Math.min(Math.max(1, page), pages);
  const hasPrev = current > 1;
  const hasNext = current < pages;

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Search pagination">
      {hasPrev ? (
        <Link
          href={searchHref(q, current - 1)}
          rel="prev"
          className={`${PAGE_BASE} border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700`}
        >
          Previous
        </Link>
      ) : (
        <span className={`${PAGE_BASE} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400`}>
          Previous
        </span>
      )}

      {pageItems(current, pages).map((item, index) =>
        item === GAP ? (
          <span key={`gap-${index}`} className="px-1 text-slate-400">
            {GAP}
          </span>
        ) : item === current ? (
          <span key={item} aria-current="page" className={`${PAGE_BASE} border-brand-600 bg-brand-600 text-white`}>
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={searchHref(q, item)}
            className={`${PAGE_BASE} border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700`}
          >
            {item}
          </Link>
        ),
      )}

      {hasNext ? (
        <Link
          href={searchHref(q, current + 1)}
          rel="next"
          className={`${PAGE_BASE} border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700`}
        >
          Next
        </Link>
      ) : (
        <span className={`${PAGE_BASE} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400`}>
          Next
        </span>
      )}
    </nav>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Search" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = firstValue(sp.q)?.trim() ?? "";
  const page = parsePage(firstValue(sp.page));

  const result = q ? await getProducts({ search: q, perPage: 12, page }) : null;

  return (
    <Container className="py-10">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Search</h1>
        <div className="mt-5 max-w-xl">
          <SearchBox defaultValue={q} />
        </div>
      </header>

      {q === "" ? (
        <div className="mt-10">
          <EmptyState
            title="Search the store"
            description="Enter a product name, SKU or keyword above to find what you are looking for."
          />
        </div>
      ) : result ? (
        <section className="mt-8">
          <p className="text-sm text-slate-500">
            {result.total} result{result.total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
          </p>

          {result.items.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <SearchPagination q={q} page={result.page} pages={result.pages} />
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title={`No results for "${q}"`}
                description="Check the spelling or try a more general keyword."
                action={
                  <ButtonLink href="/shop" variant="outline">
                    Browse the shop
                  </ButtonLink>
                }
              />
            </div>
          )}
        </section>
      ) : null}
    </Container>
  );
}
