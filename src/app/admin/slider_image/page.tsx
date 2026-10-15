import { deleteSlider } from "@/app/admin/slider_image/actions";
import { connection } from "next/server";
import { AdminSection, PaginatorRow } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

const PER_PAGE = 15;

// Page-scoped tweaks: keep the toolbar "Add" button on one line on phones and
// hold the table thumbnails at the 50px avatar size the Laravel view uses.
const SLIDER_LIST_STYLE = `.slider-list .form-btn{white-space:nowrap}.slider-list table td{vertical-align:middle}.slider-list .user-avatar-image{width:50px;height:50px;object-fit:cover}`;

export default async function SliderImageIndexPage({
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

  const where = term ? { slider_title: { contains: term } } : {};

  const [sliders, total] = await Promise.all([
    prisma.sliders.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.sliders.count({ where }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  const stateIds = [
    ...new Set(
      sliders
        .map((slider) => slider.state_id)
        .filter((id): id is number => id !== null),
    ),
  ];
  const states = stateIds.length
    ? await prisma.states.findMany({ where: { id: { in: stateIds } } })
    : [];
  const stateNames = new Map(states.map((state) => [state.id, state.name]));

  return (
    <AdminSection title="Slider image">
      <style dangerouslySetInnerHTML={{ __html: SLIDER_LIST_STYLE }} />
      <div className="card slider-list">
        <div className="card-body">
          <div className="row">
            <div className="mt-0 mb-3 col-12 d-flex justify-content-end">
              <div className="p-2">
                <form method="get">
                  <input
                    type="search"
                    name="search"
                    defaultValue={term}
                    className="form-control"
                    placeholder={t("common.search")}
                    id="search"
                  />
                </form>
              </div>
              <div className="p-2">
                <a
                  href="/admin/slider_image/create"
                  className="btn btn-primary form-btn"
                >
                  <i className="fas fa-plus"></i>&nbsp;&nbsp; Add
                </a>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>State</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sliders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <p className="text-center text-muted my-4">
                          {term === ""
                            ? t("common.no_data_available_in_table")
                            : t("common.no_matching")}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sliders.map((slider, index) => (
                      <tr key={slider.id}>
                        <td>{(page - 1) * PER_PAGE + index + 1}</td>
                        <td>
                          <img
                            width="50"
                            src={
                              slider.slider_image
                                ? `/${slider.slider_image}`
                                : ""
                            }
                            alt={slider.slider_title ?? ""}
                            className="rounded-circle user-avatar-image"
                          />
                        </td>
                        <td>{slider.slider_title}</td>
                        <td>{slider.slider_description}</td>
                        <td>
                          {slider.state_id !== null
                            ? (stateNames.get(slider.state_id) ?? "N/A")
                            : "N/A"}
                        </td>
                        <td>{slider.start_date}</td>
                        <td>{slider.end_date}</td>
                        <td style={{ display: "flex", alignItems: "center" }}>
                          <a
                            href={`/admin/slider_image/${slider.id}/edit`}
                            className="dropdown-item dropdown-item-desc edit-btn"
                            data-id={slider.id}
                          >
                            <i className="fas fa-edit mr-2 card-edit-icon"></i>{" "}
                            {t("common.edit")}
                          </a>
                          <form action={deleteSlider}>
                            <input type="hidden" name="id" value={slider.id} />
                            <button
                              type="submit"
                              className="dropdown-item dropdown-item-desc delete-btn border-0 bg-transparent"
                              data-id={slider.id}
                            >
                              <i className="fas fa-trash mr-2 card-delete-icon"></i>
                              {t("common.delete")}
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <PaginatorRow
            currentPage={page}
            lastPage={lastPage}
            perPage={PER_PAGE}
            total={total}
            basePath="/admin/slider_image"
            query={{ search: term }}
          />
        </div>
      </div>
    </AdminSection>
  );
}
