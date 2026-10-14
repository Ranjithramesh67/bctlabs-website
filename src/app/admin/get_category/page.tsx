import { deleteCategory } from "@/app/admin/category/actions";
import { connection } from "next/server";
import { AdminSection, PaginatorRow } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { htmlDecode, strLimit } from "@/lib/admin/format";

export const instant = false;

const PER_PAGE = 30;

export default async function CategoryIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { page: pageParam, search } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const term = (search ?? "").trim();

  const where = term
    ? { category_name: { contains: term.toLowerCase() } }
    : {};

  const [categories, total] = await Promise.all([
    prisma.categories.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.categories.count({ where }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminSection title={t("expense_category.expense_category")}>
      <div className="card">
        <div className="card-body">
          <div className="row mb-3 justify-content-end flex-wrap">
            <div className="col-6">
              <form className="selectgroup float-left" method="get">
                <input
                  type="search"
                  name="search"
                  defaultValue={term}
                  placeholder={t("common.search")}
                  autoComplete="off"
                  className="form-control customer-dashboard-ticket-search"
                />
              </form>
            </div>
            <div className="col-6">
              <div className="float-right">
                <a
                  href="/admin/category/create"
                  className="btn btn-primary form-btn"
                >
                  <i className="fas fa-plus"></i>&nbsp;Add New
                </a>
              </div>
            </div>
          </div>
          <div className="users-card">
            <div className="row">
              {categories.map((category) => (
                <div className="col-xl-4 col-md-6" key={category.id.toString()}>
                  <div className="hover-effect-users position-relative mb-5 users-card-hover-border users-border">
                    <div className="users-listing-details">
                      <div className="d-flex users-listing-description align-items-center justify-content-center flex-column">
                        <div className="mb-auto w-100 users-data">
                          <div className="w-100">
                            <div>
                              <a
                                href="#"
                                className="users-listing-title text-decoration-none"
                              >
                                {strLimit(
                                  htmlDecode(category.category_name),
                                  15,
                                )}
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="edit">
                          <span>
                            <a href={`/admin/category/${category.id}/edit`}>
                              <i className="fas fa-edit mr-2 card-edit-icon"></i>
                            </a>
                          </span>
                        </div>
                        <div className="del">
                          <span>
                            <form action={deleteCategory}>
                              <input
                                type="hidden"
                                name="id"
                                value={category.id.toString()}
                              />
                              <button
                                type="submit"
                                className="border-0 bg-transparent p-0"
                                aria-label="Delete"
                              >
                                <i className="fas fa-trash mr-2 card-delete-icon"></i>
                              </button>
                            </form>
                          </span>
                        </div>
                        <div className="edit">
                          <span>
                            <a href={`/admin/category/${category.id}/edit`}>
                              <i className="fas fa-edit mr-2 card-edit-icon"></i>
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between assigned-user pt-0 pl-3 px-5">
                      <div>
                        <div
                          className="text-center badge badge-success font-weight-bold"
                          title="Total Categories"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <PaginatorRow
            currentPage={page}
            lastPage={lastPage}
            perPage={PER_PAGE}
            total={total}
            basePath="/admin/get_category"
            query={{ search: term }}
          />
        </div>
      </div>
    </AdminSection>
  );
}
