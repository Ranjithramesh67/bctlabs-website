import { AdminSection } from "@/components/admin/ui";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const instant = false;

// Livewire `Support::$paginate`.
const PER_PAGE = 7;

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
  let hours = date.getUTCHours();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  if (hours === 0) {
    hours = 12;
  }
  const hh = String(hours).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hh}:${mm} ${meridiem}`;
}

/** Mirrors the Blade `is_array($support->attachment)` branch. */
function attachmentSrc(raw: string | null): string {
  if (!raw) {
    return "/default.png";
  }
  let value: unknown = raw;
  try {
    value = JSON.parse(raw);
  } catch {
    value = raw;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return `/${value[0]}`;
  }
  if (typeof value === "string" && value.length > 0) {
    return `/${value}`;
  }
  return "/default.png";
}

export default async function SupportIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { search } = await searchParams;
  const term = (search ?? "").trim();

  // Livewire `Support::getSupports()` -> `SupportTicket::latest()`.
  const where = term ? { subject: { contains: term } } : {};
  const supports = await prisma.support_tickets.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: PER_PAGE,
  });

  const customerIds = [
    ...new Set(
      supports
        .map((support) => support.customer_id)
        .filter((id): id is bigint => id !== null)
        .map((id) => Number(id)),
    ),
  ];
  const customers = customerIds.length
    ? await prisma.users.findMany({ where: { id: { in: customerIds } } })
    : [];
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));

  return (
    <AdminSection title={t("contact.support")}>
      <style>{`
        .ticket-card {
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          background: #fff;
          margin-bottom: 20px;
        }
        .support-toolbar,
        .support-filters,
        .ticket-card-row {
          flex-wrap: wrap;
          gap: 10px;
        }
        .support-toolbar .selectgroup { min-width: 240px; }
        .ticket-card .ticket-card-info { min-width: 0; }
        .ticket-card .ticket-card-info strong,
        .ticket-card .ticket-card-info small {
          overflow-wrap: anywhere;
        }
        .ticket-card .ticket-avatar {
          flex-shrink: 0;
          object-fit: cover;
        }
        .ticket-card p { overflow-wrap: anywhere; }
        @media (max-width: 575.98px) {
          .support-toolbar .selectgroup,
          .support-toolbar .selectgroup form,
          .support-toolbar .selectgroup .form-control { width: 100%; }
          .support-filters { justify-content: flex-start !important; }
          .support-filters .form-control {
            flex: 1 1 45%;
            width: auto !important;
          }
        }
        .badge-tag {
          padding: 5px 10px;
          font-size: 12px;
          margin-right: 5px;
          border-radius: 20px;
        }
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          border-radius: 34px;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        .toggle-switch input:checked + .slider { background-color: #28a745; }
        .toggle-switch input:checked + .slider:before { transform: translateX(22px); }
      `}</style>
      <div className="card">
        <div className="card-body">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4 support-toolbar">
              <h4>Support Ticket</h4>
              <div className="selectgroup float-right">
                <form method="get">
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
            </div>

            <div className="d-flex justify-content-end mb-3 support-filters">
              <select
                className="form-control mr-2"
                style={{ width: 150 }}
                defaultValue="All Priority"
                aria-label="All Priority"
              >
                <option>All Priority</option>
                <option>Medium</option>
                <option>High</option>
                <option>Low</option>
              </select>
              <select
                className="form-control"
                style={{ width: 150 }}
                defaultValue="All Status"
                aria-label="All Status"
              >
                <option>All Status</option>
                <option>Open</option>
                <option>Pending</option>
              </select>
            </div>

            {supports.length === 0 ? (
              <p className="text-center text-muted my-4">
                {t("contact.no_ticket_available")}
              </p>
            ) : (
              supports.map((support) => {
                const customer = customerById.get(Number(support.customer_id));
                return (
                  <div className="ticket-card" key={support.id.toString()}>
                    <div className="d-flex justify-content-between align-items-center ticket-card-row">
                      <div className="d-flex">
                        <img
                          src={attachmentSrc(support.attachment)}
                          className="rounded-circle mr-3 ticket-avatar"
                          alt=""
                          width={50}
                          height={50}
                        />
                        <div className="ticket-card-info">
                          <strong>{customer?.first_name}</strong>
                          <br />
                          <small>{customer?.email}</small>
                          <br />
                          <span className="badge badge-danger badge-tag">
                            {support.priority}
                          </span>
                          <span className="badge badge-primary badge-tag">
                            {support.status}
                          </span>
                          <br />
                          <small className="text-muted">
                            {formatDateTime(support.updated_at)}
                          </small>
                        </div>
                      </div>
                      <div>
                        <label className="toggle-switch">
                          <input type="checkbox" defaultChecked />
                          <span className="slider"></span>
                        </label>
                        <a
                          href={`/admin/support_chat/${support.id}`}
                          className="btn btn-primary ml-3 btn-sm"
                        >
                          View
                        </a>
                      </div>
                    </div>
                    <p className="mt-3 mb-0">{support.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminSection>
  );
}
