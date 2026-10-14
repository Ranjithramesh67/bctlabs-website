import Link from "next/link";

import { t } from "@/lib/i18n";

export function AdminSection({
  title,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-header">
        <h1>{title}</h1>
        {backHref ? (
          <div className="section-header-breadcrumb">
            <Link
              href={backHref}
              className="btn btn-primary form-btn float-right-mobile"
            >
              {backLabel ?? t("common.back")}
            </Link>
          </div>
        ) : null}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

/**
 * Bootstrap pagination matching Laravel's `$paginator->links()` markup.
 * Builds links against `basePath` while preserving the given query params.
 */
export function Paginator({
  currentPage,
  lastPage,
  basePath,
  query = {},
}: {
  currentPage: number;
  lastPage: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (lastPage <= 1) {
    return null;
  }

  const hrefFor = (page: number): string => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      }
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  // Windowed page numbers similar to Laravel's default pagination view.
  const window = 3;
  const start = Math.max(1, currentPage - window);
  const end = Math.min(lastPage, currentPage + window);
  const pages: number[] = [];
  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  return (
    <nav>
      <ul className="pagination">
        {currentPage > 1 ? (
          <li className="page-item">
            <Link className="page-link" href={hrefFor(currentPage - 1)}>
              &laquo;
            </Link>
          </li>
        ) : (
          <li className="page-item disabled">
            <span className="page-link">&laquo;</span>
          </li>
        )}
        {start > 1 ? (
          <li className="page-item">
            <Link className="page-link" href={hrefFor(1)}>
              1
            </Link>
          </li>
        ) : null}
        {start > 2 ? (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        ) : null}
        {pages.map((page) =>
          page === currentPage ? (
            <li key={page} className="page-item active">
              <span className="page-link">{page}</span>
            </li>
          ) : (
            <li key={page} className="page-item">
              <Link className="page-link" href={hrefFor(page)}>
                {page}
              </Link>
            </li>
          ),
        )}
        {end < lastPage - 1 ? (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        ) : null}
        {end < lastPage ? (
          <li className="page-item">
            <Link className="page-link" href={hrefFor(lastPage)}>
              {lastPage}
            </Link>
          </li>
        ) : null}
        {currentPage < lastPage ? (
          <li className="page-item">
            <Link className="page-link" href={hrefFor(currentPage + 1)}>
              &raquo;
            </Link>
          </li>
        ) : (
          <li className="page-item disabled">
            <span className="page-link">&raquo;</span>
          </li>
        )}
      </ul>
    </nav>
  );
}

/**
 * Livewire-style "showing x - y of z" pagination summary plus the page links.
 */
export function PaginatorRow({
  currentPage,
  lastPage,
  perPage,
  total,
  basePath,
  query,
}: {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (total === 0) {
    return null;
  }
  const first = (currentPage - 1) * perPage + 1;
  const last = Math.min(currentPage * perPage, total);

  return (
    <div className="mt-0 mb-5 col-12">
      <div className="row paginatorRow">
        <div className="col-lg-2 col-md-6 col-sm-12 pt-2">
          <span className="d-inline-flex">
            {t("common.showing")}
            <span className="font-weight-bold ml-1 mr-1">{first}</span> -
            <span className="font-weight-bold ml-1">{last}</span> of
            <span className="font-weight-bold ml-1">{total}</span>
          </span>
        </div>
        <div className="col-lg-10 col-md-6 col-sm-12 d-flex justify-content-end">
          <Paginator
            currentPage={currentPage}
            lastPage={lastPage}
            basePath={basePath}
            query={query}
          />
        </div>
      </div>
    </div>
  );
}
