import { readFile, readdir } from "node:fs/promises";
import { connection } from "next/server";
import path from "node:path";

import { notFound, redirect } from "next/navigation";

import { updateTranslation } from "@/app/admin/translation-manager/actions";
import {
  type PhpArray,
  parsePhpArray,
} from "@/app/admin/translation-manager/php-array";
import { TranslationFileSelect } from "@/components/admin/translation-file-select";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const instant = false;

const LANG_ROOT = path.join(process.cwd(), "lang");
const INDEX_PATH = "/admin/translation-manager";

/** `str_replace('_', ' ', ucfirst($key))`. */
function humaniseKey(key: string): string {
  const upper = key.charAt(0).toUpperCase() + key.slice(1);
  return upper.replace(/_/g, " ");
}

function isArrayValue(value: PhpArray[string]): value is PhpArray {
  return typeof value === "object" && value !== null;
}

/**
 * `TranslationManagerController::showTranslation` — renders every key of the
 * selected language file as an editable input (see `translation_manager.fields`).
 */
export default async function TranslationEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ language: string }>;
  searchParams: Promise<{ name?: string; file?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { language: languageParam } = await params;
  const { name: nameParam, file: fileParam } = await searchParams;

  const languageId = Number(languageParam);
  if (!Number.isInteger(languageId) || languageId <= 0) {
    notFound();
  }
  const language = await prisma.languages.findUnique({
    where: { id: languageId },
  });
  if (!language) {
    notFound();
  }

  const selectedLang = (nameParam ?? language.name).trim() || language.name;
  const selectedFile = (fileParam ?? "messages.php").trim() || "messages.php";

  // checkLanguageExistOrNot / checkFileExistOrNot: redirect back on failure.
  const langDir = path.join(LANG_ROOT, selectedLang);
  const entries = await readdir(langDir, { withFileTypes: true }).catch(
    () => null,
  );
  if (entries === null) {
    redirect(INDEX_PATH);
  }
  const fileNames = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  if (!fileNames.includes(selectedFile)) {
    redirect(INDEX_PATH);
  }

  let translations: PhpArray = {};
  try {
    translations = parsePhpArray(
      await readFile(path.join(langDir, selectedFile), "utf8"),
    );
  } catch {
    translations = {};
  }

  const options = fileNames.map((fileName) => ({
    value: fileName,
    label: fileName.charAt(0).toUpperCase() + fileName.slice(1),
  }));

  return (
    <section className="section">
      <div className="section-header">
        <h1>{t("translation_manager")}</h1>
        <div className="section-header-breadcrumb">
          <a
            href={INDEX_PATH}
            className="btn btn-primary addLanguageModal form-btn float-right-mobile"
          >
            {t("common.back")}
          </a>
        </div>
      </div>
      <div className="section-body">
        <div className="card">
          <form action={updateTranslation}>
            <input type="hidden" name="language_id" value={language.id} />
            <div className="card-header d-flex">
              <div className="subFolderFiles">
                <TranslationFileSelect
                  languageName={selectedLang}
                  fileName={selectedFile}
                  options={options}
                  baseUrl={`/admin/language/translation/${language.id}`}
                />
              </div>
              <div className="section-header-breadcrumb ml-auto mobile-btn-mt">
                <button type="submit" className="btn btn-primary form-btn">
                  {t("common.save")}
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(translations).map(([key, value]) => {
                  if (isArrayValue(value)) {
                    return Object.entries(value).map(
                      ([nestedKey, nestedValue]) => {
                        if (isArrayValue(nestedValue)) {
                          return null;
                        }
                        return (
                          <div
                            className="col-lg-4 col-md-6 mb-4"
                            key={`${key}.${nestedKey}`}
                          >
                            <label>{humaniseKey(nestedKey)} :</label>
                            <input
                              type="text"
                              className="form-control"
                              name={`${key}[${nestedKey}]`}
                              defaultValue={
                                nestedValue === null ? "" : String(nestedValue)
                              }
                            />
                          </div>
                        );
                      },
                    );
                  }
                  return (
                    <div className="col-lg-4 col-md-6 mb-4" key={key}>
                      <label>{humaniseKey(key)} :</label>
                      <input
                        type="text"
                        className="form-control"
                        name={key}
                        defaultValue={value === null ? "" : String(value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
