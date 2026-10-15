"use client";

import { useState } from "react";

import { PaginatorRow } from "@/components/admin/ui";
import { htmlDecode, strLimit } from "@/lib/admin/format";
import { t } from "@/lib/i18n";

import { deleteCity, storeCity, updateCity } from "@/app/admin/countries/actions";

type City = {
  id: number;
  name: string | null;
  state_id: number | null;
};

type Option = {
  id: number;
  name: string;
};

export function CitiesGrid({
  cities,
  states,
  stateId,
  term,
  currentPage,
  lastPage,
  total,
  perPage,
}: {
  cities: City[];
  states: Option[];
  stateId: number;
  term: string;
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);

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
          {cities.length > 0 ? (
            <div className="content">
              <div className="row position-relative">
                {cities.map((city) => (
                  <div
                    className="col-12 col-sm-12 col-md-6 col-xl-4 mb-3"
                    key={city.id}
                  >
                    <div className="hover-effect-country position-relative mb-4 country-card-hover-border">
                      <div className="country-listing-details">
                        <div className="country-listing-description">
                          <div className="country-data mb-2">
                            <h3 className="country-listing-title mb-1">
                              <a
                                href="#"
                                className="text-dark text-decoration-none countries-listing-text show-btn"
                                data-id={city.id}
                                data-toggle="tooltip"
                                title={htmlDecode(city.name)}
                              >
                                {strLimit(htmlDecode(city.name), 8, "...")}
                              </a>
                            </h3>
                          </div>

                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              onClick={() => setEditing(city)}
                              className="btn btn-warning btn-sm mr-2"
                            >
                              <i className="fa fa-edit"></i>
                            </button>
                            <form action={deleteCity}>
                              <input type="hidden" name="id" value={city.id} />
                              <input
                                type="hidden"
                                name="state_id"
                                value={stateId}
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
                basePath={`/admin/cities/${stateId}`}
                query={{ search: term }}
              />
            </div>
          ) : (
            <div className="col-lg-12 col-md-12 d-flex justify-content-center">
              <p className="text-center text-muted my-4">
                {term ? "No Cities Found" : "No Cities Available"}
              </p>
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
                <h5 className="modal-title">New City</h5>
                <button
                  type="button"
                  aria-label="Close"
                  className="close"
                  onClick={() => setAdding(false)}
                >
                  &times;
                </button>
              </div>
              <form action={storeCity}>
                <div className="modal-content">
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="name">City Name</label>
                      <span className="required">*</span>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label htmlFor="state_id">State</label>
                      <span className="required">*</span>
                      <select
                        name="state_id"
                        className="form-control"
                        defaultValue={stateId}
                        required
                      >
                        {states.map((state) => (
                          <option value={state.id} key={state.id}>
                            {state.name}
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
          id="editCityModal"
          className="modal fade show d-block"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit City</h5>
                <button
                  type="button"
                  aria-label="Close"
                  className="close"
                  onClick={() => setEditing(null)}
                >
                  &times;
                </button>
              </div>
              <form action={updateCity}>
                <div className="modal-content">
                  <div className="modal-body">
                    <input type="hidden" name="id" value={editing.id} />
                    <div className="mb-3">
                      <label htmlFor="editName">City Name</label>
                      <span className="required">*</span>
                      <input
                        type="text"
                        name="name"
                        id="editName"
                        className="form-control"
                        defaultValue={editing.name ?? ""}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label htmlFor="editStateId">State</label>
                      <span className="required">*</span>
                      <select
                        name="state_id"
                        id="editStateId"
                        className="form-control"
                        defaultValue={editing.state_id ?? stateId}
                        required
                      >
                        {states.map((state) => (
                          <option value={state.id} key={state.id}>
                            {state.name}
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
