"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PaginatorRow } from "@/components/admin/ui";
import { htmlDecode, strLimit } from "@/lib/admin/format";
import { t } from "@/lib/i18n";

import {
  blockMember,
  destroyMember,
  toggleAdministrator,
} from "@/app/admin/members/actions";

export type MemberRow = {
  id: number;
  firstName: string | null;
  email: string | null;
  phone: string | null;
  imageUrl: string;
  isEnable: boolean;
  isBlocked: number;
};

type Filters = {
  search: string;
  status: string;
  fromDate: string;
  toDate: string;
};

export function MembersIndex({
  members,
  currentUserId,
  canManageEdit,
  canManageDelete,
  canManageStatus,
  filters,
  pagination,
}: {
  members: MemberRow[];
  currentUserId: number;
  canManageEdit: boolean;
  canManageDelete: boolean;
  canManageStatus: boolean;
  filters: Filters;
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);
  const [fromDate, setFromDate] = useState(filters.fromDate);
  const [toDate, setToDate] = useState(filters.toDate);
  const [blockTarget, setBlockTarget] = useState<MemberRow | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The original prefills both date inputs with today's date on page load
  // without triggering a filter (see members/index.blade.php).
  useEffect(() => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    // Mirror the legacy DOMContentLoaded prefill; it deliberately does not
    // emit a filter event, so this is a one-shot client-only initialisation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFromDate((value) => value || iso);
    setToDate((value) => value || iso);
  }, []);

  const queryString = (next: Partial<Filters>): string => {
    const merged = { ...filters, search, fromDate, toDate, ...next };
    const params = new URLSearchParams();
    if (merged.search) params.set("search", merged.search);
    if (merged.status !== "") params.set("is_enable", merged.status);
    if (merged.fromDate) params.set("fromDate", merged.fromDate);
    if (merged.toDate) params.set("toDate", merged.toDate);
    return params.toString();
  };

  const applyFilters = (next: Partial<Filters>) => {
    const qs = queryString(next);
    router.push(qs ? `/admin/members?${qs}` : "/admin/members");
  };

  const redirectTo = (): string => {
    const qs = queryString({});
    return qs ? `/admin/members?${qs}` : "/admin/members";
  };

  const firstItem = (pagination.currentPage - 1) * pagination.perPage + 1;
  const visible = members.filter((member) => member.isBlocked !== 1);

  return (
    <section className="section">
      <div className="section-header mobile-sec-header" style={{ display: "block" }}>
        <div className="d-flex">
          <h1>{t("members")}</h1>
          <div className="section-header-breadcrumb float-right">
            <div className="section-header-breadcrumb float-right">
              <div className="card-header-action mr-3 select2-mobile-margin">
                <select
                  id="memberStatus"
                  name="is_enable"
                  className="form-control"
                  value={filters.status}
                  onChange={(event) =>
                    applyFilters({ status: event.target.value })
                  }
                >
                  <option value="">{t("placeholder.select_status")}</option>
                  <option value="1">Active</option>
                  <option value="0">Deactive</option>
                </select>
              </div>
            </div>
            <div className="card-header-action mr-3">
              <input
                type="date"
                id="fromDate"
                className="form-control"
                placeholder="From Date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  applyFilters({
                    fromDate: event.target.value,
                    toDate,
                  });
                }}
              />
            </div>
            <div className="card-header-action mr-3">
              <input
                type="date"
                id="toDate"
                className="form-control"
                placeholder="To Date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  applyFilters({
                    fromDate,
                    toDate: event.target.value,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="section-body">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="mt-0 mb-3 col-12 d-flex justify-content-end">
                <div className="p-2">
                  <input
                    type="search"
                    className="form-control"
                    placeholder={t("common.search")}
                    id="search"
                    value={search}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSearch(value);
                      if (searchTimer.current) {
                        clearTimeout(searchTimer.current);
                      }
                      searchTimer.current = setTimeout(
                        () => applyFilters({ search: value }),
                        100,
                      );
                    }}
                  />
                </div>
              </div>

              <div className="col-12">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>S No</th>
                        <th>User Image</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        {canManageStatus ? <th>Status</th> : null}
                        {canManageEdit || canManageDelete ? (
                          <th>Actions</th>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody>
                      {members.length > 0 ? (
                        visible.map((member, index) => (
                          <tr key={member.id}>
                            <td>{firstItem + index - 1}</td>
                            <td>
                              <img
                                alt="image"
                                width="50"
                                src={member.imageUrl}
                                className="rounded-circle user-avatar-image"
                              />
                            </td>
                            <td>
                              <a
                                href={`/admin/members/${member.id}`}
                                className="anchor-underline"
                              >
                                {strLimit(
                                  htmlDecode(member.firstName),
                                  12,
                                  "...",
                                )}
                              </a>
                            </td>
                            <td style={{ textTransform: "lowercase" }}>
                              {member.email}
                              <span
                                data-toggle="tooltip"
                                title={t("member.email_is_verified")}
                              >
                                <i className="fas fa-check-circle email-verified"></i>
                              </span>
                            </td>
                            <td>{member.phone}</td>
                            {canManageStatus ? (
                              <td>
                                {member.id !== currentUserId ? (
                                  <form action={toggleAdministrator}>
                                    <input
                                      type="hidden"
                                      name="id"
                                      value={member.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="redirect_to"
                                      value={redirectTo()}
                                    />
                                    <label
                                      className="custom-switch pl-0"
                                      data-placement="bottom"
                                      data-toggle="tooltip"
                                      title={t("common.status")}
                                    >
                                      <input
                                        type="checkbox"
                                        name="is_enable"
                                        className="custom-switch-input is-administrator"
                                        data-id={member.id}
                                        value="1"
                                        data-class="is_enable"
                                        defaultChecked={member.isEnable}
                                        onChange={(event) =>
                                          event.currentTarget.form?.requestSubmit()
                                        }
                                      />
                                      <span className="custom-switch-indicator"></span>
                                    </label>
                                  </form>
                                ) : null}
                              </td>
                            ) : null}
                            {canManageEdit || canManageDelete ? (
                              <td style={{ display: "flex", alignItems: "center" }}>
                                {canManageEdit ? (
                                  <a
                                    href={`/admin/members/${member.id}/edit`}
                                    className="dropdown-item dropdown-item-desc edit-btn"
                                    data-id={member.id}
                                  >
                                    <i className="fas fa-edit mr-2 text-success"></i>{" "}
                                    {t("common.edit")}
                                  </a>
                                ) : null}
                                {canManageDelete && member.id !== currentUserId ? (
                                  <form
                                    action={destroyMember}
                                    onSubmit={(event) => {
                                      if (
                                        !window.confirm(
                                          t("member.delete_member_confirm"),
                                        )
                                      ) {
                                        event.preventDefault();
                                      }
                                    }}
                                  >
                                    <input
                                      type="hidden"
                                      name="id"
                                      value={member.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="redirect_to"
                                      value={redirectTo()}
                                    />
                                    <button
                                      type="submit"
                                      className="dropdown-item dropdown-item-desc delete-btn border-0 bg-transparent"
                                    >
                                      <i className="fas fa-trash mr-2 text-warning"></i>
                                      {t("common.delete")}
                                    </button>
                                  </form>
                                ) : null}
                                {canManageDelete ? (
                                  <div className="d-flex justify-content-end">
                                    <button
                                      type="button"
                                      onClick={() => setBlockTarget(member)}
                                      className="btn btn-danger text-white btn-sm mr-2"
                                    >
                                      Block
                                    </button>
                                  </div>
                                ) : null}
                              </td>
                            ) : null}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center">
                            {search.length === 0 ? (
                              <p className="text-dark">
                                {t("member.no_member_available")}
                              </p>
                            ) : (
                              <p className="text-dark">
                                {t("member.no_member_found")}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <PaginatorRow
                currentPage={pagination.currentPage}
                lastPage={pagination.lastPage}
                perPage={pagination.perPage}
                total={pagination.total}
                basePath="/admin/members"
                query={{
                  search: filters.search || undefined,
                  is_enable: filters.status || undefined,
                  fromDate: filters.fromDate || undefined,
                  toDate: filters.toDate || undefined,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {blockTarget ? (
        <div
          className="modal fade show d-block"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Block the Member</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setBlockTarget(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <form action={blockMember}>
                  <div className="form-group">
                    <label>Reason</label>
                    <input
                      type="text"
                      name="reason"
                      className="form-control"
                      required
                    />
                  </div>
                  <input
                    type="hidden"
                    name="user_id"
                    value={blockTarget.id}
                  />
                  <input
                    type="hidden"
                    name="redirect_to"
                    value={redirectTo()}
                  />
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success">
                      Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setBlockTarget(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
