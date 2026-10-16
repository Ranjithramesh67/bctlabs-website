import Link from "next/link";

export type ShopParams = Record<string, string | undefined>;

/** Build a `/shop` URL from the current query params plus optional overrides. */
export function buildShopHref(params: ShopParams, overrides: ShopParams = {}): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "") search.set(key, value);
  }
  const query = search.toString();
  return query ? `/shop?${query}` : "/shop";
}

const GAP = "...";

/** Page numbers to render, with ellipsis gaps, keeping the list compact. */
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

export function Pagination({
  page,
  pages,
  params,
}: {
  page: number;
  pages: number;
  params: ShopParams;
}) {
  if (pages <= 1) return null;

  const current = Math.min(Math.max(1, page), pages);
  const hasPrev = current > 1;
  const hasNext = current < pages;

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {hasPrev ? (
        <Link
          href={buildShopHref(params, { page: String(current - 1) })}
          className={`${PAGE_BASE} border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700`}
          rel="prev"
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
          <span
            key={item}
            aria-current="page"
            className={`${PAGE_BASE} border-brand-600 bg-brand-600 text-white`}
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={buildShopHref(params, { page: String(item) })}
            className={`${PAGE_BASE} border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700`}
          >
            {item}
          </Link>
        ),
      )}

      {hasNext ? (
        <Link
          href={buildShopHref(params, { page: String(current + 1) })}
          className={`${PAGE_BASE} border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700`}
          rel="next"
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
