import { notFound, redirect } from "next/navigation";

import { AccessDenied } from "@/components/admin/access-denied";
import { can } from "@/lib/admin/permissions";
import { htmlDecode } from "@/lib/admin/format";
import { laravelFullName } from "@/lib/api-users";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

const USER_MODEL_TYPE = "App\\Models\\User";

/**
 * `setLanguage()` resolves a code through `storage/languages.json`; the port
 * keeps the English `name` for the nine bundled locales. Unknown values fall
 * back to Laravel's `Str::camel()`.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  ar: "Arabic",
  de: "German",
  en: "English",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
  ru: "Russian",
  tr: "Turkish",
  zh: "Chinese",
};

/** PHP `Str::camel()` (`lcfirst` of the space-less, `ucfirst`-ed words). */
function camel(value: string): string {
  const studly = value
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return studly.charAt(0).toLowerCase() + studly.slice(1);
}

function setLanguage(code: string): string {
  return LANGUAGE_NAMES[code] ?? camel(code);
}

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

/** PHP `date('jS')` ordinal suffix. */
function ordinalSuffix(day: number): string {
  if (day % 10 === 1 && day !== 11) return "st";
  if (day % 10 === 2 && day !== 12) return "nd";
  if (day % 10 === 3 && day !== 13) return "rd";
  return "th";
}

/** Carbon `->translatedFormat('jS M, Y')`, e.g. `13th Oct, 2026`. */
function translatedDate(value: Date | null): string {
  if (!value) {
    return "";
  }
  const day = value.getUTCDate();
  return `${day}${ordinalSuffix(day)} ${MONTHS[value.getUTCMonth()]}, ${value.getUTCFullYear()}`;
}

/** Approximation of Carbon `->diffForHumans()`. */
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

type PermissionGroup = {
  type: string;
  permissions: { id: number; display_name: string }[];
};

/** Spatie `$member->permissions()->get()->groupBy('type')`. */
async function memberPermissions(userId: number): Promise<PermissionGroup[]> {
  const assigned = await prisma.model_has_permissions.findMany({
    where: { model_id: BigInt(userId), model_type: USER_MODEL_TYPE },
    select: { permission_id: true },
  });
  if (assigned.length === 0) {
    return [];
  }
  const permissions = await prisma.permissions.findMany({
    where: { id: { in: assigned.map((row) => row.permission_id) } },
    orderBy: { id: "asc" },
  });
  const grouped = new Map<string, PermissionGroup>();
  for (const permission of permissions) {
    const type = permission.type ?? "";
    const group = grouped.get(type) ?? { type, permissions: [] };
    group.permissions.push({
      id: Number(permission.id),
      display_name: permission.display_name ?? "",
    });
    grouped.set(type, group);
  }
  return [...grouped.values()];
}

function MemberDetails({
  member,
  permissions,
}: {
  member: {
    fullName: string;
    phone: string | null;
    email: string | null;
    isEnable: boolean;
    staffMember: boolean | null;
    sendWelcomeEmail: boolean | null;
    facebook: string | null;
    skype: string | null;
    linkedin: string | null;
    defaultLanguage: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  permissions: PermissionGroup[];
}) {
  const na = t("common.n/a");
  return (
    <>
      <div className="row">
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="name">{t("common.name")}:</label>
            <p>{htmlDecode(member.fullName)}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="phone">{t("member.phone")}:</label>
            <p>{member.phone ? member.phone : na}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="email">{t("member.email")}:</label>
            <p>{member.email}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="is_enable">{t("common.status")}:</label>
            <p>
              {member.isEnable ? t("contact.active") : t("contact.deactive")}
            </p>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="staff_member">{t("member.staff_member")}:</label>
            <p>{member.staffMember ? t("common.yes") : t("common.no")}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="send_welcome_email">
              {t("member.send_welcome_email")}:
            </label>
            <p>{member.sendWelcomeEmail ? t("common.yes") : t("common.no")}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="facebook">{t("member.facebook")}:</label>
            <p>{member.facebook ? member.facebook : na}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="skype">{t("member.skype")}:</label>
            <p>{member.skype ? member.skype : na}</p>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="linkedin">{t("member.linkedin")}:</label>
            <p>{member.linkedin ? member.linkedin : na}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="default_language">
              {t("member.default_language")}:
            </label>
            <p>{member.defaultLanguage ? setLanguage(member.defaultLanguage) : na}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="created_at">{t("common.created_on")}:</label>
            <br />
            <span
              data-toggle="tooltip"
              data-placement="right"
              title={translatedDate(member.createdAt)}
            >
              {diffForHumans(member.createdAt)}
            </span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label htmlFor="updated_at">{t("common.last_updated")}:</label>
            <br />
            <span
              data-toggle="tooltip"
              data-placement="right"
              title={translatedDate(member.createdAt)}
            >
              {diffForHumans(member.updatedAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <label htmlFor="permissions" className="section-title">
            {t("member.permissions")}:
          </label>
        </div>
        {permissions.map((group) => (
          <div
            className="col-md-6 col-lg-4 col-xl-3 col-sm-4 permission-text"
            key={group.type}
          >
            <div className="card-body">
              <div className="section-title mt-0">{group.type}</div>
              {group.permissions.map((permission) => (
                <div key={permission.id}>
                  <label>{permission.display_name}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Mirrors `members/views/tasks.blade.php` (the `$status` / `$priorities` are never passed upstream). */
function MemberTasks() {
  return (
    <section className="section">
      <div className="section-body">
        <div className="d-flex justify-content-end flex-wrap mb-3">
          <div className="mr-2">
            <select
              name="status"
              id="filter_status"
              className="form-control"
              defaultValue=""
            >
              <option value="">{t("placeholder.select_status")}</option>
            </select>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table
                className="table table-striped table-bordered"
                id="member-tasksTbl"
              >
                <thead>
                  <tr>
                    <th scope="col">{t("task.subject")}</th>
                    <th scope="col">{t("task.priority")}</th>
                    <th scope="col">{t("task.start_date")}</th>
                    <th scope="col">{t("task.due_date")}</th>
                    <th scope="col">{t("common.assignee")}</th>
                    <th scope="col">{t("task.status")}</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Mirrors `members/show.blade.php` + `members/views/{member_details,tasks}`.
 * `group` is `request('group')`, resolving to `member_details` when absent.
 */
export async function MemberShow({
  memberId,
  group,
}: {
  memberId: string;
  group?: string;
}) {
  const user = await getCurrentUser();
  if (!(await can(user, "manage_staff_member"))) {
    return <AccessDenied />;
  }

  const id = Number(memberId);
  const member = Number.isInteger(id)
    ? await prisma.users.findUnique({ where: { id } })
    : null;
  if (!member) {
    notFound();
  }

  if (user.roles.includes("staff_member") && member.is_admin) {
    redirect("/admin/members");
  }

  const groupName = group || "member_details";
  const permissions = await memberPermissions(member.id);

  return (
    <section className="section">
      <div className="section-header item-align-right">
        <h1>{t("member.member_details")}</h1>
        <div className="section-header-breadcrumb float-right">
          <a
            href={`/admin/members/${member.id}/edit`}
            className="btn btn-warning mr-2 form-btn"
          >
            {t("common.edit")}
          </a>
          <a href="/admin/members" className="btn btn-primary form-btn">
            {t("common.back")}
          </a>
        </div>
      </div>
      <div className="section-body">
        <div className="card">
          <div className="card-body">
            <ul className="nav nav-tabs mb-3" id="customerTab" role="tablist">
              <li className="nav-item">
                <a
                  href={`/admin/members/${member.id}?group=member_details`}
                  className={`nav-link ${
                    groupName === "member_details" ? "active" : ""
                  }`}
                >
                  {t("member.member_details")}
                </a>
              </li>
            </ul>
            <br />
            {groupName === "tasks" ? (
              <MemberTasks />
            ) : (
              <MemberDetails
                member={{
                  fullName: laravelFullName(
                    member.first_name,
                    member.last_name,
                  ),
                  phone: member.phone,
                  email: member.email,
                  isEnable: member.is_enable,
                  staffMember: member.staff_member,
                  sendWelcomeEmail: member.send_welcome_email,
                  facebook: member.facebook,
                  skype: member.skype,
                  linkedin: member.linkedin,
                  defaultLanguage: member.default_language,
                  createdAt: member.created_at,
                  updatedAt: member.updated_at,
                }}
                permissions={permissions}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
