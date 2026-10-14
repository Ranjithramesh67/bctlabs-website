"use client";

import { useRouter } from "next/navigation";

import { t } from "@/lib/i18n";

export type TranslationFileOption = {
  value: string;
  label: string;
};

/**
 * The `#subFolderFiles` select from `translation_manager/fields.blade.php`.
 * Changing it navigates to the same translation page for the chosen file,
 * mirroring `language_translate.js`.
 */
export function TranslationFileSelect({
  languageName,
  fileName,
  options,
  baseUrl,
}: {
  languageName: string;
  fileName: string;
  options: TranslationFileOption[];
  baseUrl: string;
}) {
  const router = useRouter();

  return (
    <select
      name="file_name"
      id="subFolderFiles"
      className="form-control w-100"
      defaultValue={fileName}
      data-placeholder={t("placeholder.select_file")}
      onChange={(event) => {
        const value = event.target.value;
        router.push(
          `${baseUrl}?name=${encodeURIComponent(
            languageName,
          )}&file=${encodeURIComponent(value)}`,
        );
      }}
    >
      {options.map((option) => (
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
