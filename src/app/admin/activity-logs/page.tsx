import { AdminSection, PaginatorRow } from "@/components/admin/ui";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { htmlDecode } from "@/lib/admin/format";
import type { Prisma } from "@/generated/prisma/client";

export const instant = false;

const PER_PAGE = 10;

/**
 * Icons used by `activityLogIcon()` in the Laravel `app/helpers.php`.
 * Keys are the fully-qualified subject model names stored in `subject_type`.
 */
const ACTIVITY_ICONS: Record<string, string> = {
  "App\\Models\\CustomerGroup": "fas fa-people-arrows",
  "App\\Models\\Customer": "fas fa-street-view",
  "App\\Models\\User": "fas fa-user",
  "App\\Models\\ArticleGroup": "fas fa-edit",
  "App\\Models\\Article": "fab fa-autoprefixer",
  "App\\Models\\ContractType": "fas fa-file-contract",
  "App\\Models\\Contract": "fas fa-file-signature",
  "App\\Models\\Goal": "fas fa-bullseye",
  "App\\Models\\Comment": "fas fa-comment",
  "App\\Models\\Contact": "fas fa-user",
};

function activityLogIcon(subjectType: string | null): string {
  return subjectType ? (ACTIVITY_ICONS[subjectType] ?? "") : "";
}

/** `html_entity_decode(strip_tags($description))`. */
function plainText(value: string): string {
  return htmlDecode(value.replace(/<[^>]*>/g, ""));
}

/** Approximation of Carbon's `$date->diffForHumans()`. */
function diffForHumans(value: Date | null): string {
  if (!value) {
    return "";
  }
  const diff = Date.now() - value.getTime();
  const future = diff < 0;
  const seconds = Math.max(0, Math.floor(Math.abs(diff) / 1000));

  const units: Array<[number, number, string]> = [
    [60, 1, "second"],
    [60, 60, "minute"],
    [24, 3600, "hour"],
    [7, 86400, "day"],
    [4, 604800, "week"],
    [12, 2629746, "month"],
    [Number.POSITIVE_INFINITY, 31556952, "year"],
  ];

  let amount = 0;
  let unit = "second";
  for (const [limit, divisor, name] of units) {
    if (seconds / divisor < limit) {
      amount = Math.max(1, Math.round(seconds / divisor));
      unit = name;
      break;
    }
  }

  const label = `${amount} ${unit}${amount === 1 ? "" : "s"}`;
  return future ? `in ${label}` : `${label} ago`;
}

/** `App\Models\User` → `User` (used to derive the notification/activity class). */
function causerName(
  causers: Map<number, string>,
  causerId: bigint | null,
): string {
  if (causerId === null) {
    return "";
  }
  return causers.get(Number(causerId)) ?? "";
}

/**
 * jsrender template kept verbatim from
 * `resources/views/activity_logs/templates/templates.php`.
 */
const ACTIVITY_LOGS_TEMPLATE = `
    <div class="activity position-relative">
        <div class="activity-icon bg-primary text-white">
            <i class="activity-icon-size {{:subject_type}}"></i>
        </div>
        <div class="activity-detail">
            <div class="mb-2 d-flex">
                <span class="text-job text-primary">{{:created_at}}</span>
                <span class="ml-auto position-relative">{{:created_by}}</span>
            </div>
            <span class="post-id text-dark">{{:description}}</span>
        </div>
    </div>




`;

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const {
    page: pageParam,
    startDate: startParam,
    endDate: endParam,
  } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const startDate = (startParam ?? "").trim();
  const endDate = (endParam ?? "").trim();
  const hasRange = startDate !== "" && endDate !== "";

  // ActivityLogController::index filters only on a created_at date range.
  const where: Prisma.activity_logWhereInput = hasRange
    ? {
        created_at: {
          gte: new Date(`${startDate}T00:00:00.000Z`),
          lte: new Date(`${endDate}T23:59:59.999Z`),
        },
      }
    : {};

  const [activityLogs, total] = await Promise.all([
    prisma.activity_log.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.activity_log.count({ where }),
  ]);

  // Eager-load the `createdBy` (User) relation for the current page.
  const causerIds = [
    ...new Set(
      activityLogs
        .map((log) => log.causer_id)
        .filter((id): id is bigint => id !== null),
    ),
  ];
  const causers = causerIds.length
    ? await prisma.users.findMany({
        where: { id: { in: causerIds.map(Number) } },
        select: { id: true, first_name: true, last_name: true },
      })
    : [];
  const causerNames = new Map(
    causers.map((causer) => [
      causer.id,
      [causer.first_name, causer.last_name].filter(Boolean).join(" ").trim(),
    ]),
  );

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminSection title={t("activity_log.activity_logs")}>
      {/*
        The theme ships `.date_range_for_created_at_date { width: 100% }` for the
        daterangepicker placeholder. In Laravel that control lived in the section
        header breadcrumb; here it sits in the filter row, so the full width made
        it claim a whole line and pushed the real date inputs down. Constrain it
        to its content so all filters stay on one row (and wrap on phones).
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .activity-log-filter #time_range {
              width: auto;
              flex: 0 1 auto;
            }
          `,
        }}
      />
      <form
        method="get"
        className="activity-log-filter d-flex flex-wrap align-items-center mb-3"
      >
        <div
          id="time_range"
          className="time_range date_range_for_created_at_date"
        >
          <i className="far fa-calendar-alt" aria-hidden="true"></i>
          &nbsp;&nbsp;
          <span>{hasRange ? `${startDate} - ${endDate}` : ""}</span>{" "}
          <b className="caret"></b>
        </div>
        <input
          type="date"
          name="startDate"
          defaultValue={startDate}
          className="form-control ml-2"
          style={{ width: "auto" }}
          aria-label="Start date"
        />
        <span className="mx-2">&ndash;</span>
        <input
          type="date"
          name="endDate"
          defaultValue={endDate}
          className="form-control"
          style={{ width: "auto" }}
          aria-label="End date"
        />
        <button type="submit" className="btn btn-primary ml-2">
          {t("common.search")}
        </button>
      </form>
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body activity-logs-data">
              <div className="section-body">
                <div className="row">
                  <div className="col-12 col-xs-12 col-sm-12 col-md-12 col-lg-6">
                    <div className="activity-div">
                      <div className="activities">
                        {activityLogs.length > 0 ? (
                          activityLogs.map((activityLog) => (
                            <div
                              className="activity position-relative"
                              key={activityLog.id.toString()}
                            >
                              <div className="activity-icon bg-primary text-white">
                                <i
                                  className={`activity-icon-size ${activityLogIcon(
                                    activityLog.subject_type,
                                  )}`}
                                ></i>
                              </div>
                              <div className="activity-detail">
                                <div className="mb-2 d-flex">
                                  <span className="text-job text-primary">
                                    {diffForHumans(activityLog.created_at)}
                                  </span>
                                  <span className="ml-auto position-relative">
                                    {htmlDecode(
                                      causerName(
                                        causerNames,
                                        activityLog.causer_id,
                                      ),
                                    )}
                                  </span>
                                </div>
                                <span className="post-id text-dark">
                                  {plainText(activityLog.description)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-state" data-height="400">
                            <div className="empty-state-icon">
                              <i className="fas fa-question"></i>
                            </div>
                            <h2>
                              {t("activity_log.we_could_find_any_data")}
                            </h2>
                            <p className="lead">
                              {t(
                                "activity_log.sorry_we_not_find_any_data",
                              )}
                              .
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="load-more-logs text-center display-none">
                      <p className="font-size-20px">
                        <i className="fas fa-spinner fa-spin"></i>&nbsp;&nbsp;{" "}
                        {t("activity_log.loading_more_date")}
                      </p>
                    </div>
                    <div className="no-found-more-logs">
                      <span className="text-center"></span>
                    </div>
                  </div>
                </div>
              </div>
              <PaginatorRow
                currentPage={page}
                lastPage={lastPage}
                perPage={PER_PAGE}
                total={total}
                basePath="/admin/activity-logs"
                query={{ startDate, endDate }}
              />
            </div>
          </div>
        </div>
      </div>
      <script
        id="activityLogsTemplate"
        type="text/x-jsrender"
        dangerouslySetInnerHTML={{ __html: ACTIVITY_LOGS_TEMPLATE }}
      />
    </AdminSection>
  );
}
