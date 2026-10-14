import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type SettingsMap = Record<string, string>;

/** All settings keyed by `key`, memoised for the current request. */
export const getSettings = cache(async (): Promise<SettingsMap> => {
  const rows = await prisma.settings.findMany({
    select: { key: true, value: true },
  });
  const map: SettingsMap = {};
  for (const row of rows) {
    map[row.key] = row.value ?? "";
  }
  return map;
});

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const settings = await getSettings();
  return settings[key] ?? fallback;
}

/** `getAppName()`: falls back to the app name when unset. */
export async function getAppName(): Promise<string> {
  return (await getSetting("company_name")) || "BCT Labs";
}

/** `getAppLogo()`: the stored logo URL, if any. */
export async function getAppLogo(): Promise<string> {
  return getSetting("logo");
}

/** `getAppFavicon()`. */
export async function getAppFavicon(): Promise<string> {
  return getSetting("favicon");
}

/** `getWebsiteName()`. */
export async function getWebsiteName(): Promise<string> {
  return getSetting("website");
}

/**
 * Font Awesome class for the configured `current_currency`, matching
 * `getCurrencyClass()`.
 */
export async function getCurrencyClass(): Promise<string> {
  const currency = (await getSetting("current_currency")).toLowerCase();
  switch (currency) {
    case "inr":
      return "fas fa-rupee-sign";
    case "aud":
    case "usd":
    case "cad":
      return "fas fa-dollar-sign";
    case "eur":
      return "fas fa-euro-sign";
    case "jpy":
      return "fas fa-yen-sign";
    case "gbp":
      return "fas fa-pound-sign";
    default:
      return "fas fa-dollar-sign";
  }
}

/** Setting group ids (`Setting::GROUP_ARRAY`). */
export const SETTING_GROUPS = {
  general: 1,
  company_information: 2,
  note: 3,
} as const;

export type SettingGroup = keyof typeof SETTING_GROUPS;
