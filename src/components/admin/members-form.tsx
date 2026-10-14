"use client";

import { useState } from "react";

import { t } from "@/lib/i18n";

import { storeMember, updateMember } from "@/app/admin/members/actions";

export type DepartmentOption = { id: number; name: string };
export type PermissionOption = { id: number; display_name: string };
export type PermissionGroup = {
  type: string;
  permissions: PermissionOption[];
};

/** Mirrors `getLanguages()` (the nine locales under `lang/`, English labels). */
const LANGUAGES = [
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "tr", label: "Turkish" },
  { code: "zh", label: "Chinese" },
];

const DEFAULT_AVATAR = "/assets/img/infyom-logo.png";

function PasswordInput({
  name,
  id,
  placeholder,
  required,
  confirmation,
}: {
  name: string;
  id: string;
  placeholder: string;
  required?: boolean;
  confirmation?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-group">
      <input
        type={visible ? "text" : "password"}
        name={name}
        id={id}
        className="form-control"
        autoComplete="off"
        required={required}
        placeholder={placeholder}
      />
      <div
        className="input-group-append"
        id={confirmation ? "show_hide_cPassword" : "show_hide_password"}
      >
        <div className="input-group-text">
          <button
            className={
              confirmation ? "btn btn-default cPassword-show" : "btn btn-default password-show"
            }
            type="button"
            onClick={() => setVisible((value) => !value)}
          >
            <i
              className={visible ? "fa fa-eye" : "fa fa-eye-slash"}
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageField({ defaultImage }: { defaultImage?: string }) {
  const [preview, setPreview] = useState(defaultImage ?? DEFAULT_AVATAR);
  return (
    <div className="row">
      <div className="form-group col-lg-3 col-md-6 col-sm-12">
        <span id="validationErrorsBox" className="text-danger"></span>
        <div className="row">
          <div className="col-6">
            <label htmlFor="logo" className="profile-label-color">
              {t("member.profile")}:
            </label>
            <label className="image__file-upload text-white">
              {" "}
              {t("setting.choose")}
              <input
                type="file"
                name="image"
                id="logo"
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
          <div className="col-2 pl-0 mt-1">
            <img
              id="logoPreview"
              className="img-thumbnail thumbnail-preview"
              src={preview}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveRow() {
  return (
    <div className="row">
      <div className="form-group col-sm-12">
        <button
          type="submit"
          className="btn btn-primary"
          id="btnSave"
          data-loading-text="<span class='spinner-border spinner-border-sm'></span> Processing..."
        >
          {t("common.save")}
        </button>
        <a href="/admin/members" className="btn btn-secondary text-dark">
          {t("common.cancel")}
        </a>
      </div>
    </div>
  );
}

export function MembersCreateForm({
  departments,
  permissionGroups,
}: {
  departments: DepartmentOption[];
  permissionGroups: PermissionGroup[];
}) {
  return (
    <form action={storeMember} method="post" id="createMember">
      <div className="row">
        <div className="form-group col-sm-6">
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
          />
        </div>
        <div className="form-group col-sm-6">
          <label htmlFor="last_name">{t("member.last_name")}:</label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            className="form-control"
            autoComplete="off"
            placeholder={t("member.last_name")}
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-sm-6">
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
          />
        </div>
        <div className="form-group col-sm-3">
          <label htmlFor="password">{t("member.password")}:</label>
          <span className="required">*</span>
          <PasswordInput
            name="password"
            id="password"
            placeholder={t("member.password")}
            required
          />
        </div>
        <div className="form-group col-sm-3">
          <label htmlFor="cPassword">
            {t("member.password_confirmation")}:
          </label>
          <span className="required">*</span>
          <PasswordInput
            name="password_confirmation"
            id="cPassword"
            placeholder={t("member.password_confirmation")}
            required
            confirmation
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-sm-6">
          <label htmlFor="phoneNumber">{t("member.phone")}:</label>
          <span className="required">*</span>
          <br />
          <input
            type="tel"
            name="phone"
            id="phoneNumber"
            className="form-control"
            required
            onChange={(event) => {
              event.target.value = event.target.value.replace(/\D/g, "");
            }}
          />
          <input type="hidden" name="prefix_code" id="prefix_code" />
          <span id="valid-msg" className="hide">
            {t("placeholder.valid_number")}
          </span>
          <span id="error-msg" className="hide"></span>
        </div>
        <div className="form-group col-sm-6">
          <label htmlFor="facebookUrl">{t("member.facebook")}:</label>
          <input
            type="text"
            name="facebook"
            id="facebookUrl"
            className="form-control"
            autoComplete="off"
            placeholder={t("member.facebook")}
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-sm-6">
          <label htmlFor="css_no">CSS NUMBER</label>
          <input
            type="text"
            name="css_no"
            id="css_no"
            className="form-control"
            autoComplete="off"
            placeholder="CSS NUMBER"
          />
        </div>
        <div className="form-group col-sm-6">
          <label htmlFor="branch">Branch</label>
          <select
            name="branch"
            id="branch"
            className="form-control"
            autoComplete="off"
            defaultValue=""
          >
            <option value="">Branch</option>
            {departments.map((department) => (
              <option value={department.id} key={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="form-group col-sm-6">
          <label htmlFor="linkedInUrl">{t("member.linkedin")}:</label>
          <input
            type="text"
            name="linkedin"
            id="linkedInUrl"
            className="form-control"
            autoComplete="off"
            placeholder={t("member.linkedin")}
          />
        </div>
        <div className="form-group col-sm-6">
          <label htmlFor="skypeUrl">{t("member.skype")}:</label>
          <input
            type="text"
            name="skype"
            id="skypeUrl"
            className="form-control"
            autoComplete="off"
            placeholder={t("member.skype")}
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-sm-6">
          <label htmlFor="languageId">{t("member.default_language")}:</label>
          <select
            name="default_language"
            id="languageId"
            className="form-control"
            defaultValue=""
          >
            <option value="">{t("placeholder.select_language")}</option>
            {LANGUAGES.map((language) => (
              <option value={language.code} key={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ImageField />
      <div className="row">
        <div className="form-group col-sm-12">
          <label htmlFor="permissions" className="section-title">
            {t("member.permissions")}:
          </label>
        </div>
      </div>
      <div className="row">
        {permissionGroups.map((group) => (
          <div
            className="col-md-6 col-lg-4 col-xl-3 col-sm-4 permission-text"
            key={group.type}
          >
            <div className="card-body">
              <div className="section-title mt-0">{group.type}</div>
              {group.permissions.map((permission) => (
                <div
                  className="custom-control custom-checkbox"
                  key={permission.id}
                >
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id={`customCheck${permission.id}`}
                    name="permissions[]"
                    value={permission.id}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor={`customCheck${permission.id}`}
                  >
                    {permission.display_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SaveRow />
    </form>
  );
}

export function MembersEditForm({
  member,
}: {
  member: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    imageUrl: string;
  };
}) {
  return (
    <form action={updateMember} method="post" id="editMember">
      <input type="hidden" name="id" value={member.id} />
      <div className="row">
        <div className="form-group col-sm-6">
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
            defaultValue={member.firstName}
          />
        </div>
        <div className="form-group col-sm-6">
          <label htmlFor="last_name">{t("member.last_name")}:</label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            className="form-control"
            autoComplete="off"
            placeholder={t("member.last_name")}
            defaultValue={member.lastName}
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-sm-6">
          <label htmlFor="email">{t("common.email")}:</label>
          <span className="required">*</span>
          <input
            type="email"
            name="email"
            id="email"
            className="form-control"
            required
            readOnly
            autoComplete="off"
            placeholder={t("common.email")}
            defaultValue={member.email}
          />
        </div>
        <div className="form-group col-sm-6">
          <label htmlFor="phoneNumber">{t("member.phone")}:</label>
          <span className="required">*</span>
          <br />
          <input
            type="tel"
            name="phone"
            id="phoneNumber"
            className="form-control"
            required
            readOnly
            defaultValue={member.phone}
          />
          <input type="hidden" name="prefix_code" id="prefix_code" />
          <span id="valid-msg" className="hide">
            {t("placeholder.valid_number")}
          </span>
          <span id="error-msg" className="hide"></span>
        </div>
      </div>
      <ImageField defaultImage={member.imageUrl} />
      <SaveRow />
    </form>
  );
}
