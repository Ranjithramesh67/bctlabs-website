"use client";

import { useState } from "react";

import {
  destroyLanguage,
  storeLanguage,
  updateLanguage,
} from "@/app/admin/translation-manager/actions";
import { t } from "@/lib/i18n";

export type TranslationLanguage = {
  id: number;
  name: string;
};

/**
 * jsrender action template kept verbatim from
 * `resources/views/translation_manager/templates/templates.php`.
 */
const ACTION_TEMPLATE = `
   <a title="${t("common.edit")}" class="btn btn-warning action-btn has-icon edit-translator-btn" data-id="{{:id}}">
            <i class="fa fa-edit"></i>
   </a>
   <a title="${t("common.delete")}" class="btn btn-danger action-btn has-icon delete-translate-language" data-id="{{:id}}" href="#">
            <i class="fa fa-trash"></i>
   </a>
`;

/** Restricts the language short code to letters/spaces, like `language_translate.js`. */
function restrictLanguageName(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key.length === 1 && !/[A-Za-z\s]/.test(event.key)) {
    event.preventDefault();
  }
}

export function TranslationManager({
  languages,
}: {
  languages: TranslationLanguage[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  async function openEdit(id: number) {
    const response = await fetch(`/admin/translation-manager/${id}/edit`);
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as {
      success: boolean;
      data?: { id: number; name: string };
    };
    if (payload.success && payload.data) {
      setEditId(payload.data.id);
      setEditName(payload.data.name ?? "");
    }
  }

  function closeEdit() {
    setEditId(null);
    setEditName("");
  }

  return (
    <section className="section">
      <div className="section-header">
        <h1>{t("translation_manager")}</h1>
        <div className="section-header-breadcrumb">
          <button
            type="button"
            className="btn btn-primary addLanguageModal form-btn float-right-mobile"
            onClick={() => setAddOpen(true)}
          >
            {t("common.add")} <i className="fas fa-plus "></i>
          </button>
        </div>
      </div>
      <div className="section-body">
        <div className="card">
          <div className="card-body">
            <div className="table-responsive-sm table-responsive-md overflow-hidden">
              <table
                className="table table-responsive-sm table-responsive-md table-striped table-bordered"
                id="translatorManagerTbl"
              >
                <thead>
                  <tr>
                    <th scope="col">{t("common.name")}</th>
                    <th scope="col">
                      {t("translator_manager.translation")}
                    </th>
                    <th scope="col" className="text-center" style={{ width: "8%" }}>
                      {t("common.action")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((language) => (
                    <tr key={language.id}>
                      <td>{language.name}</td>
                      <td>
                        <a
                          href={`/admin/language/translation/${language.id}`}
                          className="text-decoration-none"
                        >
                          Edit Translation
                        </a>
                      </td>
                      <td className="text-center" style={{ width: "8%" }}>
                        <button
                          type="button"
                          title={t("common.edit")}
                          className="btn btn-warning action-btn has-icon edit-translator-btn"
                          data-id={language.id}
                          onClick={() => openEdit(language.id)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <form action={destroyLanguage} className="d-inline">
                          <input
                            type="hidden"
                            name="id"
                            value={language.id}
                          />
                          <button
                            type="submit"
                            title={t("common.delete")}
                            className="btn btn-danger action-btn has-icon delete-translate-language"
                            data-id={language.id}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {addOpen ? (
          <div
            id="addModal"
            className="modal fade show d-block"
            role="dialog"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="skillHeader">
                    {t("new_language")}
                  </h5>
                  <button
                    type="button"
                    aria-label="Close"
                    className="close"
                    onClick={() => setAddOpen(false)}
                  >
                    &times;
                  </button>
                </div>
                <form action={storeLanguage} id="addNewForm">
                  <div className="modal-body">
                    <div
                      className="alert alert-danger d-none"
                      id="validationErrorsBox"
                    ></div>
                    <div className="row">
                      <span className="ml-3">
                        <b>{t("common.note")}</b>:{" "}
                        {t("translator_manager.language_short_code")}.
                      </span>
                      <div className="form-group col-sm-12">
                        <label htmlFor="name">{t("common.name")}:</label>
                        <span className="text-danger">*</span>
                        <input
                          type="text"
                          name="name"
                          className="form-control langName"
                          required
                          maxLength={2}
                          placeholder={t("common.name")}
                          onKeyDown={restrictLanguageName}
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
                        onClick={() => setAddOpen(false)}
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

        {editId !== null ? (
          <div
            id="editLanguageModal"
            className="modal fade show d-block"
            role="dialog"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="skillHeader">
                    {t("translator_manager.edit_language")}
                  </h5>
                  <button
                    type="button"
                    aria-label="Close"
                    className="close"
                    onClick={closeEdit}
                  >
                    &times;
                  </button>
                </div>
                <form
                  action={updateLanguage}
                 
                  id="editLanguageForm"
                >
                  <div className="modal-body">
                    <div
                      className="alert alert-danger d-none"
                      id="validationErrorsBox"
                    ></div>
                    <div className="row">
                      <input
                        type="hidden"
                        name="language_id"
                        id="languageId"
                        value={editId}
                      />
                      <span className="ml-3">
                        <b>{t("common.note")}</b>:{" "}
                        {t("translator_manager.language_short_code")}.
                      </span>
                      <div className="form-group col-sm-12">
                        <label htmlFor="name">{t("common.name")}:</label>
                        <span className="text-danger">*</span>
                        <input
                          type="text"
                          name="name"
                          className="form-control langName"
                          required
                          maxLength={2}
                          placeholder={t("common.name")}
                          defaultValue={editName}
                          onKeyDown={restrictLanguageName}
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
                        onClick={closeEdit}
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

        <script
          id="translatorManagerActionTemplate"
          type="text/x-jsrender"
          dangerouslySetInnerHTML={{ __html: ACTION_TEMPLATE }}
        />
      </div>
    </section>
  );
}
