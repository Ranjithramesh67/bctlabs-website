"use client";

import { useState } from "react";

import { PaginatorRow } from "@/components/admin/ui";
import { htmlDecode, strLimit } from "@/lib/admin/format";
import { t } from "@/lib/i18n";

import { deleteCountry, storeCountry, updateCountry } from "./actions";

type Country = {
  id: number;
  name: string;
};

export function CountriesGrid({
  countries,
  term,
  currentPage,
  lastPage,
  total,
  perPage,
}: {
  countries: Country[];
  term: string;
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);

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
          {countries.length > 0 ? (
            <div className="content">
              <div className="row position-relative">
                {countries.map((country) => (
                  <div
                    className="col-12 col-sm-12 col-md-6 col-xl-4 mb-3"
                    key={country.id}
                  >
                    <div className="hover-effect-country position-relative mb-4 country-card-hover-border">
                      <div className="country-listing-details">
                        <div className="country-listing-description">
                          <div className="country-data mb-2">
                            <h3 className="country-listing-title mb-1">
                              <a
                                href={`/admin/states/${country.id}`}
                                className="text-dark text-decoration-none countries-listing-text show-btn"
                                data-id={country.id}
                                data-toggle="tooltip"
                                title={htmlDecode(country.name)}
                              >
                                {strLimit(htmlDecode(country.name), 8, "...")}
                              </a>
                            </h3>
                            <span className="text-primary small d-block">
                              Click here to view related states
                            </span>
                          </div>

                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              onClick={() => setEditing(country)}
                              className="btn btn-warning btn-sm mr-2"
                            >
                              <i className="fa fa-edit"></i>
                            </button>
                            <form action={deleteCountry}>
                              <input
                                type="hidden"
                                name="id"
                                value={country.id}
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
                basePath="/admin/countries"
                query={{ search: term }}
              />
            </div>
          ) : (
            <div className="col-lg-12 col-md-12 d-flex justify-content-center">
              {term ? (
                <p className="text-dark">{t("country.no_country_found")}</p>
              ) : (
                <p className="text-dark">{t("country.no_country_available")}</p>
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
                <h5 className="modal-title">{t("country.new_country")}</h5>
                <button
                  type="button"
                  aria-label="Close"
                  className="close"
                  onClick={() => setAdding(false)}
                >
                  &times;
                </button>
              </div>
              <form id="addNewForm" action={storeCountry}>
                <div className="modal-body">
                  <div
                    className="alert alert-danger d-none"
                    id="validationErrorsBox"
                  ></div>
                  <div className="row">
                    <div className="form-group col-sm-12">
                      <label htmlFor="name">{t("country.name")}:</label>
                      <span className="required">*</span>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        required
                        autoComplete="off"
                        placeholder={t("country.name")}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      id="btnSave"
                    >
                      {t("common.save")}
                    </button>
                    <button
                      type="button"
                      id="btnCancel"
                      className="btn btn-light ml-1"
                      onClick={() => setAdding(false)}
                    >
                      {t("common.cancel")}
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
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          id="editCountryModal"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t("country.edit_country")}</h5>
                <button
                  type="button"
                  className="close"
                  aria-label="Close"
                  onClick={() => setEditing(null)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form id="editForm" action={updateCountry}>
                <div className="modal-body">
                  <div
                    className="alert alert-danger d-none"
                    id="editValidationErrorsBox"
                  ></div>
                  <input
                    type="hidden"
                    name="id"
                    defaultValue={editing.id}
                    id="countryId"
                  />
                  <div className="row">
                    <div className="form-group col-sm-12">
                      <label htmlFor="editName">{t("country.name")}:</label>
                      <span className="required">*</span>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editing.name}
                        className="form-control"
                        required
                        id="editName"
                        autoComplete="off"
                        placeholder={t("country.name")}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      id="btnEditSave"
                    >
                      {t("common.save")}
                    </button>
                    <button
                      type="button"
                      id="btnEditCancel"
                      className="btn btn-light ml-1"
                      onClick={() => setEditing(null)}
                    >
                      {t("common.cancel")}
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
