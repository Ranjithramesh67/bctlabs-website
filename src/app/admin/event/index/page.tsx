import { deleteEvent } from "@/app/admin/event/actions";
import { connection } from "next/server";
import { AccessDenied } from "@/components/admin/access-denied";
import { AdminSection, PaginatorRow } from "@/components/admin/ui";
import { Prisma } from "@/generated/prisma/client";
import { can } from "@/lib/admin/permissions";
import { htmlDecode, strLimit } from "@/lib/admin/format";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const instant = false;

const PER_PAGE = 15;

export default async function EventIndexPage({
  searchParams,
}: {
  searchParams: Promise<{
    pages?: string;
    page?: string;
    search?: string;
  }>;
}) {
  // Session- and DB-backed list: render at request time (Cache Components).
  await connection();
  const user = await getCurrentUser();
  if (!(await can(user, "manage_staff_member"))) {
    return <AccessDenied />;
  }

  const { pages: pagesParam, page: pageParam, search } = await searchParams;
  const pages = pagesParam ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const term = (search ?? "").trim();

  const where: Prisma.eventsWhereInput = { type: pages, is_deleted: 0 };
  if (term) {
    where.title = { contains: term.toLowerCase() };
  }

  const [events, total] = await Promise.all([
    prisma.events.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.events.count({ where }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminSection title="List">
      <div className="card">
        <div className="card-body">
          <div className="row mb-3 justify-content-end flex-wrap">
            <div className="col-6">
              <form className="selectgroup float-left" method="get">
                <input type="hidden" name="pages" value={pages} />
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
                  href={`/admin/event/create?pages=${encodeURIComponent(pages)}`}
                  className="btn btn-primary form-btn"
                >
                  <i className="fas fa-plus"></i>&nbsp;Add New
                </a>
              </div>
            </div>
          </div>
          <div className="users-card">
            <div className="row">
              {events.map((event) => (
                <div className="col-xl-4 col-md-6" key={event.id.toString()}>
                  <div className="hover-effect-users position-relative mb-5 users-card-hover-border users-border">
                    <div className="users-listing-details">
                      <div className="d-flex users-listing-description align-items-center justify-content-center flex-column">
                        <div className="pl-0 mb-2 users-avatar">
                          <img
                            src={`/${event.main_image}`}
                            alt={event.title}
                            className="img-responsive users-avatar-img users-img mr-2"
                          />
                        </div>
                        <div className="mb-auto w-100 users-data">
                          <div className="d-flex justify-content-center align-items-center w-100">
                            <div className="text-center">
                              <a
                                href="#"
                                className="users-listing-title text-decoration-none"
                              >
                                {strLimit(htmlDecode(event.title), 15, "...")}
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="edit">
                          <span>
                            <a
                              href={`/admin/event/${event.id}/edit?pages=${encodeURIComponent(event.type)}`}
                            >
                              <i className="fas fa-edit mr-2 card-edit-icon"></i>
                            </a>
                          </span>
                        </div>
                        <div className="del">
                          <span>
                            <form action={deleteEvent}>
                              <input
                                type="hidden"
                                name="id"
                                value={event.id.toString()}
                              />
                              <input
                                type="hidden"
                                name="pages"
                                value={event.type}
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
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between assigned-user pt-0 pl-3 px-5">
                      <div>
                        <div
                          className="text-center badge badge-success font-weight-bold"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Total Events"
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
            basePath="/admin/event/index"
            query={{ pages, search: term }}
          />
        </div>
      </div>
    </AdminSection>
  );
}
