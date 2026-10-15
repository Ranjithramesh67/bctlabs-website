"use client";

import { useState } from "react";

import { PaginatorRow } from "@/components/admin/ui";
import { htmlDecode, strLimit } from "@/lib/admin/format";
import { t } from "@/lib/i18n";

import { deleteLanguage, saveLanguage } from "./actions";

type Language = {
  id: number;
  name: string;
  description: string | null;
};

export function LanguageGrid({
  languages,
  term,
  currentPage,
  lastPage,
  total,
  perPage,
}: {
  languages: Language[];
  term: string;
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (language: Language) => {
    setEditing(language);
    setIsOpen(true);
  };

  return (
    <>
      {isOpen ? (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editing ? "Edit language" : "Create language"}
                </h5>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="close"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <form action={saveLanguage}>
                  {editing ? (
                    <input
                      type="hidden"
                      name="language_id"
                      defaultValue={editing.id}
                    />
                  ) : null}
                  <div className="form-group">
                    <label>language Code</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editing?.name ?? ""}
                      className="form-control"
                      placeholder={"like:'en,tm  '"}
                    />
                  </div>
                  <div className="form-group">
                    <label>language</label>
                    <input
                      type="text"
                      name="description"
                      defaultValue={editing?.description ?? ""}
                      className="form-control"
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success">
                      {editing ? "Update" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="btn btn-secondary"
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
      <div className="row">
        <div className="col-lg-12 col-md-12">
          <div className="row mb-3 flex-wrap">
            <div className="col-lg-2 justify-content-start float-left">
              <button
                type="button"
                onClick={openCreate}
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
          {languages.length > 0 ? (
            <div className="content">
              <div className="row position-relative">
                {languages.map((language) => (
                  <div
                    className="col-12 col-sm-12 col-md-6 col-xl-4 mb-3"
                    key={language.id}
                  >
                    <div className="hover-effect-country position-relative mb-4 country-card-hover-border">
                      <div className="country-listing-details">
                        <div className="country-listing-description">
                          <div className="country-data mb-2">
                            <h3 className="country-listing-title mb-1">
                              <a
                                href="#"
                                className="text-dark text-decoration-none countries-listing-text show-btn"
                                data-id={language.id}
                                data-toggle="tooltip"
                                title={htmlDecode(language.description)}
                              >
                                {strLimit(
                                  htmlDecode(language.description),
                                  8,
                                  "...",
                                )}
                              </a>
                            </h3>
                          </div>

                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              onClick={() => openEdit(language)}
                              className="btn btn-warning btn-sm mr-2"
                            >
                              <i className="fa fa-edit"></i>
                            </button>
                            <form action={deleteLanguage}>
                              <input
                                type="hidden"
                                name="id"
                                value={language.id}
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
                basePath="/admin/language"
                query={{ search: term }}
              />
            </div>
          ) : (
            <div className="col-lg-12 col-md-12 d-flex justify-content-center">
              <p className="text-center text-muted my-4">
                {term ? "No Language Found" : "No Languages Available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
