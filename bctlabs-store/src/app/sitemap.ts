import type { MetadataRoute } from "next";

import { getStoreSettings } from "@/lib/settings";
import { getCategories, getPages, getPosts, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "",
  "/shop",
  "/about-us",
  "/contact-us",
  "/shipping-returns",
  "/blog",
  "/order-tracking",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getStoreSettings();
  const base = settings.url.replace(/\/+$/, "");
  const url = (path: string) => `${base}${path}`;

  const [products, categories, pages, posts] = await Promise.all([
    getProducts({ perPage: 1000 }),
    getCategories(),
    getPages(),
    getPosts(200),
  ]);

  return [
    ...STATIC_ROUTES.map((path) => ({ url: url(path), changeFrequency: "weekly" as const, priority: path ? 0.7 : 1 })),
    ...categories.map((category) => ({ url: url(`/category/${category.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...products.items.map((product) => ({
      url: url(`/product/${product.slug}`),
      lastModified: undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pages.map((page) => ({
      url: url(`/pages/${page.slug}`),
      lastModified: page.updated ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...posts.map((post) => ({
      url: url(`/blog/${post.slug}`),
      lastModified: post.date ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
