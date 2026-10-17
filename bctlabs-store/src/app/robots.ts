import type { MetadataRoute } from "next";

import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getStoreSettings();
  const base = settings.url.replace(/\/+$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/account", "/cart", "/checkout"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
