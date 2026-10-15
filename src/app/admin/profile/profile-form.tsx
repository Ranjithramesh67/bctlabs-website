"use client";

import { useEffect, useState } from "react";

import { t } from "@/lib/i18n";

import { changeLanguage, changePassword, updateProfile } from "./actions";

export type LanguageOption = {
  code: string;
  label: string;
};

/**
 * The `.row` title block is a direct child of the form, so Bootstrap's -15px
 * gutters bleed past the page edge; the preview thumbnail also overflows its
 * narrow column. Scope both to this page and keep the previews a fixed size.
 */
const PROFILE_PAGE_CSS = `
.admin-profile #updateProfile > .row {
  margin-left: 0;
  margin-right: 0;
}
.admin-profile .user-profile-image,
.admin-profile .thumbnail-preview {
  width: 70px;
  height: 70px;
  object-fit: cover;
}
.admin-profile .preview-image-video-container {
  max-width: 100%;
}
`;

type ProfileUser = {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  facebook: string;
  linkedin: string;
  skype: string;
  imageUrl: string;
  defaultLanguage: string;
};

export function ProfileForm({
  user,
  languages,
}: {
  user: ProfileUser;
  languages: LanguageOption[];
}) {
  const [preview, setPreview] = useState(user.imageUrl);
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // The admin header links to /admin/profile#change-password / #change-language.
  useEffect(() => {
    const applyHash = () => {
      setShowPassword(window.location.hash === "#change-password");
      setShowLanguage(window.location.hash === "#change-language");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const closePassword = () => {
    setShowPassword(false);
    if (window.location.hash === "#change-password") {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  const closeLanguage = () => {
    setShowLanguage(false);
    if (window.location.hash === "#change-language") {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  return (
    <div className="admin-profile">
      <style dangerouslySetInnerHTML={{ __html: PROFILE_PAGE_CSS }} />
      <form id="updateProfile" action={updateProfile} className="needs-validation">
        <div className="row">
          <div className="col-sm-6">
            <h2 className="section-title">{user.fullName}</h2>
            <p className="section-lead">
              {t(
                "change_password.change_information_about_yourself_on_this_page",
              )}
            </p>
          </div>
        </div>
        <div className="col-12 col-sm-12 col-lg-12">
          <div className="card author-box card-primary">
            <div className="card-body">
              <div className="author-box-left">
                <img
                  alt="image"
                  src={user.imageUrl}
                  className="rounded-circle user-profile-image"
                />
                <div className="clearfix"></div>
              </div>
              <div className="author-box-details">
                <div className="author-box-name mt-2">
                  <span className="font-weight-bold">{user.fullName}</span>
                </div>
                {user.facebook ? (
                  <a
                    href={user.facebook}
                    className="btn btn-social-icon facebook-color mr-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                ) : null}
                {user.skype ? (
                  <a
                    href={user.skype}
                    className="btn btn-social-icon skype-color mr-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fab fa-skype"></i>
                  </a>
                ) : null}
                {user.linkedin ? (
                  <a
                    href={user.linkedin}
                    className="btn btn-social-icon linkedin-color mr-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-12">
          <div className="card">
            <div className="card-header">
              <h4>{t("change_password.edit_profile")}</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="form-group col-md-6 col-12">
                  <label htmlFor="first_name">{t("member.first_name")}:</label>
                  <span className="required">*</span>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    className="form-control"
                    required
                    autoComplete="off"
                    placeholder={t("member.first_name")}
                    defaultValue={user.firstName}
                  />
                </div>
                <div className="form-group col-md-6 col-12">
                  <label htmlFor="last_name">{t("member.last_name")}:</label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    className="form-control"
                    autoComplete="off"
                    placeholder={t("member.last_name")}
                    defaultValue={user.lastName}
                  />
                </div>
              </div>
              <div className="row">
                <div className="form-group col-md-6 col-12">
                  <label htmlFor="email">{t("common.email")}:</label>
                  <span className="required">*</span>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"
                    required
                    autoComplete="off"
                    placeholder={t("common.email")}
                    defaultValue={user.email}
                  />
                </div>
                <div className="form-group col-md-6 col-12">
                  <label htmlFor="phoneNumber">{t("customer.phone")}:</label>
                  <br />
                  <input
                    type="tel"
                    name="phone"
                    id="phoneNumber"
                    className="form-control"
                    defaultValue={user.phone}
                  />
                  <input type="hidden" name="prefix_code" id="prefix_code" />
                  <span id="valid-msg" className="hide">
                    {t("placeholder.valid_number")}
                  </span>
                  <span id="error-msg" className="hide"></span>
                </div>
              </div>
              <div className="row">
                <div className="form-group col-sm-6">
                  <label htmlFor="facebookUrl">{t("member.facebook")}:</label>
                  <input
                    type="text"
                    name="facebook"
                    id="facebookUrl"
                    className="form-control"
                    autoComplete="off"
                    placeholder={t("member.facebook")}
                    defaultValue={user.facebook}
                  />
                </div>
                <div className="form-group col-sm-6">
                  <label htmlFor="linkedInUrl">{t("member.linkedin")}:</label>
                  <input
                    type="text"
                    name="linkedin"
                    id="linkedInUrl"
                    className="form-control"
                    autoComplete="off"
                    placeholder={t("member.linkedin")}
                    defaultValue={user.linkedin}
                  />
                </div>
              </div>
              <div className="row">
                <div className="form-group col-sm-6">
                  <label htmlFor="skypeUrl">{t("member.skype")}:</label>
                  <input
                    type="text"
                    name="skype"
                    id="skypeUrl"
                    className="form-control"
                    autoComplete="off"
                    placeholder={t("member.skype")}
                    defaultValue={user.skype}
                  />
                </div>
                <div className="form-group col-sm-12 col-md-6 col-lg-3">
                  <span id="validationErrorBox" className="text-danger"></span>
                  <div className="row no-gutters">
                    <div className="col-6">
                      <label
                        htmlFor="profileImage"
                        className="profile-label-color"
                      >
                        {t("user.profile")}:
                      </label>
                      <label className="image__file-upload">
                        {t("setting.choose")}
                        <input
                          type="file"
                          name="image"
                          id="profileImage"
                          className="d-none"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              setPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="col-4">
                      <div className="preview-image-video-container pl-0 mt-1">
                        <img
                          id="previewImage"
                          className="img-thumbnail thumbnail-preview"
                          src={preview}
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer text-right">
              <button type="submit" id="btnSave" className="btn btn-primary">
                {t("common.save")}
              </button>
              <a
                href="/admin/dashboard"
                className="btn btn-secondary text-dark"
              >
                {t("common.cancel")}
              </a>
            </div>
          </div>
        </div>
      </form>

      {showPassword ? (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          id="changePasswordModal"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t("user.change_password")}</h5>
                <button
                  type="button"
                  className="close"
                  aria-label="Close"
                  onClick={closePassword}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form id="changePasswordForm" action={changePassword}>
                <div className="modal-body">
                  <div
                    className="alert alert-danger d-none"
                    id="editValidationErrorsBox"
                  ></div>
                  <input
                    type="hidden"
                    name="tagId"
                    id="pfUserId"
                    defaultValue={user.id}
                  />
                  <div className="form-group col-sm-12">
                    <label htmlFor="pfCurrentPassword">
                      {t("change_password.current_password")}:
                    </label>
                    <span className="required">*</span>
                    <div className="input-group">
                      <input
                        className="form-control input-group__addon"
                        id="pfCurrentPassword"
                        type={showCurrent ? "text" : "password"}
                        name="password_current"
                        required
                        autoComplete="off"
                        placeholder={t("change_password.current_password")}
                      />
                      <div className="input-group-append input-group__icon">
                        <span
                          className="input-group-text changeType"
                          onClick={() => setShowCurrent((value) => !value)}
                        >
                          <i
                            className={
                              showCurrent ? "fa fa-eye" : "fa fa-eye-slash"
                            }
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group col-sm-12">
                    <label htmlFor="pfNewPassword">
                      {t("change_password.new_password")}:
                    </label>
                    <span className="required">*</span>
                    <div className="input-group">
                      <input
                        className="form-control input-group__addon"
                        id="pfNewPassword"
                        type={showNew ? "text" : "password"}
                        name="password"
                        required
                        autoComplete="off"
                        placeholder={t("change_password.new_password")}
                      />
                      <div className="input-group-append input-group__icon">
                        <span
                          className="input-group-text changeType"
                          onClick={() => setShowNew((value) => !value)}
                        >
                          <i
                            className={
                              showNew ? "fa fa-eye" : "fa fa-eye-slash"
                            }
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group col-sm-12">
                    <label htmlFor="pfNewConfirmPassword">
                      {t("change_password.confirm_password")}:
                    </label>
                    <span className="required">*</span>
                    <div className="input-group">
                      <input
                        className="form-control input-group__addon"
                        id="pfNewConfirmPassword"
                        type={showConfirm ? "text" : "password"}
                        name="password_confirmation"
                        required
                        autoComplete="off"
                        placeholder={t("change_password.confirm_password")}
                      />
                      <div className="input-group-append input-group__icon">
                        <span
                          className="input-group-text changeType"
                          onClick={() => setShowConfirm((value) => !value)}
                        >
                          <i
                            className={
                              showConfirm ? "fa fa-eye" : "fa fa-eye-slash"
                            }
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      id="btnEditSavePassword"
                    >
                      {t("common.save")}
                    </button>
                    <button
                      type="button"
                      id="btnEditCancel"
                      className="btn btn-light ml-1"
                      onClick={closePassword}
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

      {showLanguage ? (
        <div
          id="changeLanguageModal"
          className="modal fade show d-block"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content left-margin">
              <div className="modal-header">
                <h5 className="modal-title">{t("user.change_language")}</h5>
                <button
                  type="button"
                  aria-label="Close"
                  className="close"
                  onClick={closeLanguage}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div
                  className="alert alert-danger d-none"
                  id="changeLanguageValidationErrorsBox"
                ></div>
                <form id="changeLanguageForm" action={changeLanguage}>
                  <div className="row">
                    <div className="form-group col-12">
                      <label htmlFor="defaultLanguage">
                        {t("user.language")}:
                      </label>
                      <span className="required">*</span>
                      <select
                        name="default_language"
                        id="defaultLanguage"
                        className="form-control"
                        required
                        defaultValue={user.defaultLanguage}
                      >
                        {languages.map((language) => (
                          <option key={language.code} value={language.code}>
                            {language.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="btn btn-primary mr-2"
                      id="btnLanguageChange"
                    >
                      {t("common.save")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-light left-margin"
                      onClick={closeLanguage}
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
