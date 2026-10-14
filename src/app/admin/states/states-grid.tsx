"use client";

import { useState } from "react";

import { PaginatorRow } from "@/components/admin/ui";
import { htmlDecode, strLimit } from "@/lib/admin/format";
import { t } from "@/lib/i18n";

import { deleteState, storeState, updateState } from "@/app/admin/countries/actions";

type State = {
  id: number;
  name: string;
  country_id: number;
};

type Option = {
  id: number;
  name: string;
};

export function StatesGrid({
  states,
  countries,
  countryId,
  term,
  currentPage,
  lastPage,
  total,
  perPage,
}: {
  states: State[];
  countries: Option[];
  countryId: number;
  term: string;
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<State | null>(null);

  return (
    <>
      <div className="row">
        <div className="col-lg-12 col-md-12">
          <div className="row mb-3 flex-wrap">
            <div className="col-lg-2 justify-content-start float-left">
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="btn btn-primary mb-3 float-right-mobile"
              >
                <i className="fas fa-plus-circle"></i>&nbsp;&nbsp;Add New
              </button>
            </div>
            <div className="col-lg-10 justify-content-end float-right-mobile">
              <form
                className="selectgroup mr-3 justify-content-end float-right-mobile"
                method="get"
              >
                <input
                  type="search"
                  name="search"
                  defaultValue={term}
                  autoComplete="off"
                  id="search"
                  placeholder={t("common.search")}
                  className="form-control"
                />
              </form>
            </div>
          </div>
          {states.length > 0 ? (
            <div className="content">
              <div className="row position-relative">
                {states.map((state) => (
                  <div
                    className="col-12 col-sm-12 col-md-6 col-xl-4 mb-3"
                    key={state.id}
                  >
                    <div className="hover-effect-country position-relative mb-4 country-card-hover-border">
                      <div className="country-listing-details">
                        <div className="country-listing-description">
                          <div className="country-data mb-2">
                            <h3 className="country-listing-title mb-1">
                              <a
                                href={`/admin/cities/${state.id}`}
                                className="text-dark text-decoration-none countries-listing-text show-btn"
                                data-id={state.id}
                                data-toggle="tooltip"
                                title={htmlDecode(state.name)}
                              >
                                {strLimit(htmlDecode(state.name), 8, "...")}
                              </a>
                            </h3>
                            <span className="text-primary small d-block">
                              Click here to view related cities
                            </span>
                          </div>

                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              onClick={() => setEditing(state)}
                              className="btn btn-warning btn-sm mr-2"
                            >
                              <i className="fa fa-edit"></i>
                            </button>
                            <form action={deleteState}>
                              <input type="hidden" name="id" value={state.id} />
                              <input
                                type="hidden"
                                name="country_id"
                                value={countryId}
                              />
                              <button
                                type="submit"
                                className="btn btn-danger btn-sm"
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <PaginatorRow
                currentPage={currentPage}
                lastPage={lastPage}
                perPage={perPage}
                total={total}
                basePath={`/admin/states/${countryId}`}
                query={{ search: term }}
              />
            </div>
          ) : (
            <div className="col-lg-12 col-md-12 d-flex justify-content-center">
              {term ? (
                <p className="text-dark text-capitalize">No State Found</p>
              ) : (
                <p className="text-dark text-capitalize">No State Available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {adding ? (
        <div
          id="addCountryModal"
          className="modal fade show d-block"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New State</h5>
                <button
                  type="button"
                  aria-label="Close"
                  className="close"
                  onClick={() => setAdding(false)}
                >
                  &times;
                </button>
              </div>
              <form action={storeState}>
                <div className="modal-content">
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="name">State Name</label>
                      <span className="required">*</span>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label htmlFor="country_id">Country</label>
                      <span className="required">*</span>
                      <select
                        name="country_id"
                        className="form-control"
                        defaultValue={countryId}
                        required
                      >
                        {countries.map((country) => (
                          <option value={country.id} key={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success">
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setAdding(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div
          id="editStateModal"
          className="modal fade show d-block"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit State</h5>
                <button
                  type="button"
                  aria-label="Close"
                  className="close"
                  onClick={() => setEditing(null)}
                >
                  &times;
                </button>
              </div>
              <form action={updateState}>
                <div className="modal-content">
                  <div className="modal-body">
                    <input type="hidden" name="id" value={editing.id} />
                    <div className="mb-3">
                      <label htmlFor="editName">State Name</label>
                      <span className="required">*</span>
                      <input
                        type="text"
                        name="name"
                        id="editName"
                        className="form-control"
                        defaultValue={editing.name}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label htmlFor="editCountryId">Country</label>
                      <span className="required">*</span>
                      <select
                        name="country_id"
                        id="editCountryId"
                        className="form-control"
                        defaultValue={editing.country_id}
                        required
                      >
                        {countries.map((country) => (
                          <option value={country.id} key={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                      Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
