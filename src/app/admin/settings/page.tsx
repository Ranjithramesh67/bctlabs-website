import { updateSetting } from "@/app/admin/settings/actions";
import { connection } from "next/server";
import { AccessDenied } from "@/components/admin/access-denied";
import { AdminSection } from "@/components/admin/ui";
import { can } from "@/lib/admin/permissions";
import {
  getCurrencyClass,
  SETTING_GROUPS,
  type SettingGroup,
} from "@/lib/admin/settings";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const instant = false;

/** `version()` — the application version from the original composer.json. */
const APP_VERSION = "1.0.0";
const FALLBACK_LOGO = "/assets/img/infyom-logo.png";

/**
 * The theme's `.thumbnail-preview` uses `max-width: max-content` and
 * `.faviconPreview` resets the height to `auto`, so a large upload would render
 * at (or near) its natural size. Scope the previews to this page and bound them
 * so they can never overflow the card.
 */
const SETTINGS_PAGE_CSS = `
.settings-page .thumbnail-preview {
  height: auto;
  max-height: 70px;
  max-width: 160px;
  width: auto;
  object-fit: contain;
}
.settings-page .thumbnail-preview.faviconPreview {
  max-width: 70px;
  margin-top: 0 !important;
}
.settings-page .form-control {
  max-width: 100%;
}
.settings-page .settings-version label {
  white-space: nowrap;
}
`;

/** `Setting::CURRENCIES`. */
const CURRENCIES: Record<string, string> = {
  eur: "Euro (EUR)",
  aud: "Australia Dollar (AUD)",
  inr: "India Rupee (INR)",
  usd: "USA Dollar (USD)",
  jpy: "Japanese Yen (JPY)",
  gbp: "British Pound (GBP)",
  cad: "Canadian Dollar (CAD)",
};

/** `getCurrencyForPDF()` — numeric HTML entity for each currency. */
function currencyCode(currency: string): number {
  switch (currency) {
    case "inr":
      return 8377;
    case "eur":
      return 8364;
    case "jpy":
      return 165;
    case "gbp":
      return 163;
    default:
      return 36;
  }
}

/** Stored uploads are relative to `public/`, absolute URLs are legacy values. */
function assetUrl(value: string): string {
  if (!value || value.startsWith("/") || /^https?:\/\//.test(value)) {
    return value;
  }
  return `/${value}`;
}

function isSettingGroup(value: string): value is SettingGroup {
  return value in SETTING_GROUPS;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const user = await getCurrentUser();
  if (!(await can(user, "manage_settings"))) {
    return <AccessDenied />;
  }

  const { group: groupParam } = await searchParams;
  const groupName: SettingGroup =
    groupParam && isSettingGroup(groupParam) ? groupParam : "general";

  const rows = await prisma.settings.findMany({
    where: { group: SETTING_GROUPS[groupName] },
    select: { key: true, value: true },
  });
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value ?? "";
  }

  const currencyClass = await getCurrencyClass();
  const currentCurrency = settings.current_currency ?? "";
  const logo = settings.logo ? assetUrl(settings.logo) : FALLBACK_LOGO;
  const favicon = settings.favicon
    ? assetUrl(settings.favicon)
    : FALLBACK_LOGO;

  return (
    <AdminSection title={t("settings")}>
      <style dangerouslySetInnerHTML={{ __html: SETTINGS_PAGE_CSS }} />
      <div className="alert alert-danger display-none" id="validationErrorsBox"></div>
      <div className="card settings-page">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <ul className="nav nav-pills flex-column">
                    <li className="nav-item">
                      <a
                        href="/admin/settings?group=general"
                        className={`nav-link ${
                          groupName === "general" ? "active" : ""
                        }`}
                      >
                        {t("general")}
                      </a>
                      <a
                        href="/admin/settings?group=company_information"
                        className={`nav-link mobile-text-nowrap tabText ${
                          groupName === "company_information" ? "active" : ""
                        }`}
                      >
                        {t("company_information")}
                      </a>
                      <a
                        href="/admin/settings?group=note"
                        className={`nav-link tabText ${
                          groupName === "note" ? "active" : ""
                        }`}
                      >
                        {t("notes")}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <form
                action={updateSetting}
                id="settingUpdate"
              >
                {groupName === "general" ? (
                  <>
                    <div className="row">
                      <input
                        type="hidden"
                        name="group"
                        value={SETTING_GROUPS.general}
                      />
                      <div className="form-group col-sm-6">
                        <label htmlFor="company_name">
                          {t("setting.application_name")}:
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="company_name"
                          id="applicationNameId"
                          className="form-control"
                          required
                          placeholder={t("setting.application_name")}
                          defaultValue={settings.company_name ?? ""}
                        />
                      </div>
                      <div className="form-group col-sm-6">
                        <label
                          htmlFor="default_country_code"
                          className="form-label"
                        >
                          {t("common.default_country_code")}:
                        </label>
                        <span className="required"></span>
                        <input
                          type="text"
                          name="default_country_data"
                          id="defaultCountryData"
                          className="form-control"
                          placeholder={t("common.default_country_code")}
                          defaultValue=""
                        />
                        <input
                          type="hidden"
                          name="default_country_code"
                          id="defaultCountryCode"
                          value={settings.default_country_code ?? ""}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-md-12 col-lg-12 col-sm-12">
                        <label htmlFor="term_and_conditions">
                          {t("common.term_and_conditions")}:
                        </label>
                        <textarea
                          name="term_and_conditions"
                          id="term_and_conditions"
                          className="form-control summernote-simple"
                          defaultValue={settings.term_and_conditions ?? ""}
                        ></textarea>
                      </div>
                    </div>
                    <div className="row flex-responsive-column">
                      <div className="form-group col-xl-5 col-sm-12">
                        <div className="row">
                          <div className="px-3">
                            <label className="profile-label-color-upload profile-label-color">
                              {t("setting.logo")}:
                              <span className="required">*</span>
                            </label>
                            <label className="image__file-upload">
                              {" "}
                              {t("setting.choose")}
                              <input
                                type="file"
                                name="logo"
                                id="logo"
                                className="d-none"
                                accept="image/*"
                              />
                            </label>
                          </div>
                          <div className="px-3 preview-image-video-container">
                            <img
                              id="logoPreview"
                              className="img-thumbnail thumbnail-preview tPreview"
                              src={logo}
                              alt=""
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group col-xl-5 col-sm-12">
                        <div className="row">
                          <div className="px-3">
                            <label
                              htmlFor="favicon"
                              className="profile-label-color"
                            >
                              {t("setting.favicon")}:
                            </label>
                            <span className="required">*</span>
                            <label className="image__file-upload">
                              {" "}
                              {t("setting.choose")}
                              <input
                                type="file"
                                name="favicon"
                                id="favicon"
                                className="d-none"
                                accept="image/*"
                              />
                            </label>
                          </div>
                          <div className="px-3 preview-image-video-container">
                            <img
                              id="faviconPreview"
                              className="img-thumbnail thumbnail-preview tPreview faviconPreview"
                              src={favicon}
                              alt=""
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group col-xl-2 col-sm-12 settings-version">
                        <div className="row">
                          <div className="px-3">
                            <label
                              htmlFor="version"
                              className="profile-label-color"
                            >
                              {t("setting.current_version")}:
                            </label>
                            <p>{APP_VERSION}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                {groupName === "company_information" ? (
                  <>
                    <div className="row">
                      <input
                        type="hidden"
                        name="group"
                        value={SETTING_GROUPS.company_information}
                      />
                      <div className="form-group col-sm-6">
                        <label htmlFor="company">
                          {t("company.company")}:
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="company"
                          id="companyNameId"
                          className="form-control"
                          required
                          placeholder={t("company.company")}
                          defaultValue={settings.company ?? ""}
                        />
                      </div>
                      <div className="form-group col-sm-6">
                        <label htmlFor="website">
                          {t("company.website")}:
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="website"
                          id="website"
                          className="form-control"
                          required
                          autoComplete="off"
                          placeholder={t("company.website")}
                          defaultValue={settings.website ?? ""}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-sm-6">
                        <label htmlFor="vat_number">
                          {t("company.vat_number")}:
                        </label>
                        <input
                          type="text"
                          name="vat_number"
                          id="vat_number"
                          className="form-control"
                          minLength={4}
                          maxLength={15}
                          placeholder={t("company.vat_number")}
                          defaultValue={settings.vat_number ?? ""}
                        />
                      </div>
                      <div className="form-group col-sm-6">
                        <label htmlFor="current_currency">
                          {t("company.currency")}:
                        </label>
                        <span className="required">*</span>
                        <select
                          id="mySelect"
                          data-show-content="true"
                          className="form-control"
                          name="current_currency"
                          required
                          defaultValue={currentCurrency}
                        >
                          {Object.entries(CURRENCIES).map(([key, label]) => (
                            <option
                              key={key}
                              value={key}
                              data-content={`<i class='${currencyClass} text-black-50'></i> ${label}`}
                            >
                              {String.fromCharCode(currencyCode(key))}  {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-sm-6">
                        <label htmlFor="city">{t("company.city")}:</label>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          className="form-control"
                          placeholder={t("company.city")}
                          defaultValue={settings.city ?? ""}
                        />
                      </div>
                      <div className="form-group col-sm-6">
                        <label htmlFor="state">{t("company.state")}:</label>
                        <input
                          type="text"
                          name="state"
                          id="state"
                          className="form-control"
                          placeholder={t("company.state")}
                          defaultValue={settings.state ?? ""}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-sm-6">
                        <label htmlFor="country_code">
                          {t("company.country_code")}:
                        </label>
                        <input
                          type="text"
                          name="country_code"
                          id="country_code"
                          className="form-control"
                          placeholder={t("company.country_code")}
                          defaultValue={settings.country_code ?? ""}
                        />
                      </div>
                      <div className="form-group col-sm-6">
                        <label htmlFor="zip_code">
                          {t("company.zip_code")}:
                        </label>
                        <input
                          type="text"
                          name="zip_code"
                          id="zip_code"
                          className="form-control"
                          maxLength={6}
                          minLength={6}
                          placeholder={t("company.zip_code")}
                          defaultValue={settings.zip_code ?? ""}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-sm-6">
                        <label htmlFor="phone">{t("company.phone")}:</label>
                        <br />
                        <input
                          type="tel"
                          name="phone"
                          id="phoneNumber"
                          className="form-control"
                          defaultValue={settings.phone ?? ""}
                        />
                        <input
                          type="hidden"
                          name="prefix_code"
                          id="prefix_code"
                          value=""
                        />
                        <span id="valid-msg" className="hide">
                          {t("placeholder.valid_number")}
                        </span>
                        <span id="error-msg" className="hide"></span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-sm-12">
                        <label htmlFor="address">
                          {t("company.address")}:
                          <span className="required">*</span>
                        </label>
                        <textarea
                          name="address"
                          id="addressId"
                          className="form-control textarea-sizing"
                          required
                          rows={5}
                          placeholder={t("company.address")}
                          defaultValue={settings.address ?? ""}
                        ></textarea>
                      </div>
                    </div>
                  </>
                ) : null}

                {groupName === "note" ? (
                  <>
                    <div className="row">
                      <input
                        type="hidden"
                        name="group"
                        value={SETTING_GROUPS.note}
                      />
                      <div className="form-group col-sm-12 col-md-12 col-lg-12">
                        <label htmlFor="admin_note">
                          {t("common.admin_note")}:
                        </label>
                        <textarea
                          name="admin_note"
                          id="admin_note"
                          className="form-control summernote-simple"
                          defaultValue={settings.admin_note ?? ""}
                        ></textarea>
                      </div>
                      <div className="form-group col-sm-12 col-md-12 col-lg-12">
                        <label htmlFor="client_note">
                          {t("common.client_note")}:
                        </label>
                        <textarea
                          name="client_note"
                          id="client_note"
                          className="form-control summernote-simple"
                          defaultValue={settings.client_note ?? ""}
                        ></textarea>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="row">
                  <div className="form-group col-sm-12">
                    <input
                      type="submit"
                      value={t("common.save")}
                      className="btn btn-primary"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminSection>
  );
}
