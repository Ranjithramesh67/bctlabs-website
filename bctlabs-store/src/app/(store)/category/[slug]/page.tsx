import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button, Container, EmptyState, Select } from "@/components/ui";
import { getCategories, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

const SORT_VALUES = ["newest", "price-asc", "price-desc", "popular", "rating"] as const;
type SortValue = (typeof SORT_VALUES)[number];

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const PER_PAGE = 12;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseSort(raw: string | string[] | undefined): SortValue {
  const value = firstValue(raw);
  return SORT_VALUES.includes(value as SortValue) ? (value as SortValue) : "newest";
}

function parsePage(raw: string | string[] | undefined): number {
  const parsed = Number.parseInt(firstValue(raw) ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function categoryHref(slug: string, sort: SortValue, page: number): string {
  const query = new URLSearchParams();
  if (sort !== "newest") query.set("sort", sort);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return `/category/${slug}${qs ? `?${qs}` : ""}`;
}

/** Compact pagination window: [1, ..., 4, 5, 6, ..., 12]. */
function pageNumbers(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set<number>([1, total, current - 1, current, current + 1]);
  return [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: `Browse ${category.name} at BCTLABS. Electronic components, sensors, modules and STEM kits with fast dispatch across India.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const sort = parseSort(query.sort);
  const page = parsePage(query.page);

  const result = await getProducts({
    categorySlug: slug,
    page,
    perPage: PER_PAGE,
    sort,
  });

  const children = categories.filter((c) => c.parent === category.id);
  const pages = pageNumbers(result.page, result.pages);

  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/shop" className="hover:text-brand-700">
          Shop
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-slate-700">{category.name}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{category.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {result.total} {result.total === 1 ? "product" : "products"}
            {result.pages > 1 ? ` \u00b7 page ${result.page} of ${result.pages}` : ""}
          </p>
        </div>

        <form method="get" action={`/category/${category.slug}`} className="flex items-end gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort products
          </label>
          <Select id="sort" name="sort" defaultValue={sort} className="w-full sm:w-52">
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" size="md" className="shrink-0">
            Apply
          </Button>
        </form>
      </header>

      {children.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {child.name}
              <span className="text-xs text-slate-400">{child.count}</span>
            </Link>
          ))}
        </div>
      ) : null}

      <section className="mt-8">
        {result.items.length === 0 ? (
          <EmptyState
            title="No products here yet"
            description="We are still stocking this category. Explore the full catalogue in the meantime."
            action={
              <Link
                href="/shop"
                className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Shop all products
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {result.pages > 1 ? (
              <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {result.page > 1 ? (
                  <Link
                    href={categoryHref(category.slug, sort, result.page - 1)}
                    rel="prev"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                  >
                    Previous
                  </Link>
                ) : null}

                {pages.map((pageNumber, index) => {
                  const previous = pages[index - 1];
                  const gap = previous !== undefined && pageNumber - previous > 1;
                  return (
                    <span key={pageNumber} className="flex items-center gap-2">
                      {gap ? <span className="px-1 text-slate-400">&hellip;</span> : null}
                      <Link
                        href={categoryHref(category.slug, sort, pageNumber)}
                        aria-current={pageNumber === result.page ? "page" : undefined}
                        className={
                          pageNumber === result.page
                            ? "inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-brand-600 px-3 text-sm font-semibold text-white"
                            : "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                        }
                      >
                        {pageNumber}
                      </Link>
                    </span>
                  );
                })}

                {result.page < result.pages ? (
                  <Link
                    href={categoryHref(category.slug, sort, result.page + 1)}
                    rel="next"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                  >
                    Next
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        )}
      </section>
    </Container>
  );
}
