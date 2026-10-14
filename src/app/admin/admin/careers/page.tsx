import { Paginator } from "@/components/admin/ui";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { deleteCareerApplication } from "./actions";

export const instant = false;

// CareerApplicationController::index -> `paginate(10)`.
const PER_PAGE = 10;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Carbon `->format('d M Y, h:i A')`. */
function formatDateTime(date: Date | null): string {
  if (!date) {
    return "";
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  let hours = date.getUTCHours();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  if (hours === 0) {
    hours = 12;
  }
  const hh = String(hours).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hh}:${mm} ${meridiem}`;
}

export default async function CareersIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [applications, total] = await Promise.all([
    prisma.career_applications.findMany({
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.career_applications.count(),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title">Career Applications</h3>
              <div className="card-tools"></div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table
                  className="table table-bordered table-hover"
                  id="applicationsTable"
                >
                  <thead className="thead-dark">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Applied At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No applications found
                        </td>
                      </tr>
                    ) : (
                      applications.map((application, index) => (
                        <tr key={application.id.toString()}>
                          <td>{(page - 1) * PER_PAGE + index + 1}</td>
                          <td>{application.name}</td>
                          <td>{application.email}</td>
                          <td>{application.mobile}</td>
                          <td>{formatDateTime(application.created_at)}</td>
                          <td>
                            <a
                              href={`/admin/admin/careers/${application.id}`}
                              className="btn btn-sm btn-primary"
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </a>
                            <form
                              action={deleteCareerApplication}
                              style={{ display: "inline-block" }}
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={application.id.toString()}
                              />
                              <button
                                type="submit"
                                className="btn btn-sm btn-danger"
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-center mt-3">
                <Paginator
                  currentPage={page}
                  lastPage={lastPage}
                  basePath="/admin/admin/careers"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
