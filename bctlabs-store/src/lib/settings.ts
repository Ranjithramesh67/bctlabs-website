import "server-only";

import { prisma } from "./prisma";

export type StoreSettings = {
  name: string;
  description: string;
  url: string;
  currency: string;
  currencySymbol: string;
  country: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  taxRate: number;
  taxLabel: string;
  taxMode: "inclusive" | "exclusive";
  freeShippingMin: number;
  flatRate: number;
};

const DEFAULTS: StoreSettings = {
  name: "BCT Labs",
  description: "Electronic components, development boards and STEM kits.",
  url: "http://localhost:4000",
  currency: "INR",
  currencySymbol: "\u20b9",
  country: "IN",
  address: "",
  city: "",
  phone: "",
  email: "info@bctlabs.com",
  taxRate: 18,
  taxLabel: "GST",
  taxMode: "exclusive",
  freeShippingMin: 999,
  flatRate: 75,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const rows = await prisma.wp_options.findMany({
    where: {
      option_name: {
        in: [
          "blogname",
          "blogdescription",
          "siteurl",
          "woocommerce_currency",
          "woocommerce_store_address",
          "woocommerce_store_city",
          "woocommerce_store_country",
          "woocommerce_free_shipping_1_settings",
          "woocommerce_flat_rate_2_settings",
          "bq_tax_global_rate",
          "bq_tax_global_label",
          "bq_tax_global_mode",
        ],
      },
    },
  });

  const opt = new Map(rows.map((r) => [r.option_name, r.option_value ?? ""]));
  const num = (key: string, fallback: number) => {
    const raw = opt.get(key);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : fallback;
  };

  const currency = opt.get("woocommerce_currency") || DEFAULTS.currency;
  const taxModeRaw = opt.get("bq_tax_global_mode") || DEFAULTS.taxMode;

  return {
    name: opt.get("blogname") || DEFAULTS.name,
    description: opt.get("blogdescription") || DEFAULTS.description,
    url: process.env.APP_URL || opt.get("siteurl") || DEFAULTS.url,
    currency,
    currencySymbol: currency === "INR" ? "\u20b9" : currency === "USD" ? "$" : `${currency} `,
    country: opt.get("woocommerce_store_country") || DEFAULTS.country,
    address: opt.get("woocommerce_store_address") || DEFAULTS.address,
    city: opt.get("woocommerce_store_city") || DEFAULTS.city,
    phone: DEFAULTS.phone,
    email: DEFAULTS.email,
    taxRate: num("bq_tax_global_rate", DEFAULTS.taxRate),
    taxLabel: opt.get("bq_tax_global_label") || DEFAULTS.taxLabel,
    taxMode: taxModeRaw === "inclusive" ? "inclusive" : "exclusive",
    freeShippingMin: num("woocommerce_free_shipping_1_settings", DEFAULTS.freeShippingMin),
    flatRate: num("woocommerce_flat_rate_2_settings", DEFAULTS.flatRate),
  };
}

/** Accepted tax modes for the checkout form. */
export function normalizeTaxMode(value: string | null | undefined): "inclusive" | "exclusive" {
  return value === "inclusive" ? "inclusive" : "exclusive";
}

/** WooCommerce stores shipping settings as serialized `key=value&key2=value2`. */
export function parseWooSerialized(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const pair of raw.split("&")) {
    const [k, v] = pair.split("=");
    if (k) out[k] = decodeURIComponent(v ?? "");
  }
  return out;
}
