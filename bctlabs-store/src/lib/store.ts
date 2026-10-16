import "server-only";

import { prisma } from "./prisma";
import { cleanContent, toNumber } from "./format";

export type Category = {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  excerpt: string;
  description: string;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  onSale: boolean;
  sku: string;
  stockStatus: string;
  stockQuantity: number | null;
  rating: number;
  reviewCount: number;
  totalSales: number;
  image: string | null;
  gallery: string[];
  categories: Category[];
};

export type ContentPage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  updated: Date | null;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: Date | null;
  image: string | null;
};

const PLACEHOLDER = "/media/woocommerce-placeholder.webp";

function htmlDecode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

async function mediaUrls(ids: number[]): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const unique = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
  if (!unique.length) return map;
  const rows = await prisma.wp_postmeta.findMany({
    where: { post_id: { in: unique.map(BigInt) }, meta_key: "_wp_attached_file" },
    select: { post_id: true, meta_value: true },
  });
  for (const row of rows) {
    if (row.meta_value) map.set(toNumber(row.post_id), `/media/${row.meta_value}`);
  }
  return map;
}

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.wp_term_taxonomy.findMany({
    where: { taxonomy: "product_cat" },
    select: { term_id: true, term_taxonomy_id: true, count: true, parent: true },
    orderBy: { term_id: "asc" },
  });
  const terms = await prisma.wp_terms.findMany({
    where: { term_id: { in: rows.map((r) => r.term_id) } },
    select: { term_id: true, name: true, slug: true },
  });
  const termById = new Map(terms.map((t) => [toNumber(t.term_id), t]));
  return rows
    .filter((r) => toNumber(r.term_id) !== 15)
    .map((r) => {
      const term = termById.get(toNumber(r.term_id));
      return {
        id: toNumber(r.term_id),
        name: htmlDecode(term?.name ?? ""),
        slug: term?.slug ?? "",
        count: toNumber(r.count),
        parent: toNumber(r.parent),
      };
    })
    .filter((c) => c.slug);
}

/** Load every published product with its price, stock, media and categories. */
export async function loadAllProducts(): Promise<Product[]> {
  const posts = await prisma.wp_posts.findMany({
    where: { post_type: "product", post_status: "publish" },
    select: {
      ID: true,
      post_name: true,
      post_title: true,
      post_excerpt: true,
      post_content: true,
      menu_order: true,
      post_date: true,
    },
  });
  if (!posts.length) return [];

  const ids = posts.map((p) => toNumber(p.ID));
  const bigIds = ids.map(BigInt);

  const [metas, lookups, relationships, taxonomies, terms] = await Promise.all([
    prisma.wp_postmeta.findMany({
      where: {
        post_id: { in: bigIds },
        meta_key: {
          in: ["_thumbnail_id", "_product_image_gallery", "_price", "_regular_price", "_sale_price", "_sku"],
        },
      },
      select: { post_id: true, meta_key: true, meta_value: true },
    }),
    prisma.wp_wc_product_meta_lookup.findMany({ where: { product_id: { in: bigIds } } }),
    prisma.wp_term_relationships.findMany({
      where: { object_id: { in: bigIds } },
      select: { object_id: true, term_taxonomy_id: true },
    }),
    prisma.wp_term_taxonomy.findMany({
      where: { taxonomy: "product_cat" },
      select: { term_taxonomy_id: true, term_id: true, count: true, parent: true },
    }),
    prisma.wp_terms.findMany({ select: { term_id: true, name: true, slug: true } }),
  ]);

  const metaByPost = new Map<number, Map<string, string>>();
  const attachmentIds = new Set<number>();
  for (const m of metas) {
    const pid = toNumber(m.post_id);
    if (!metaByPost.has(pid)) metaByPost.set(pid, new Map());
    if (m.meta_key) metaByPost.get(pid)!.set(m.meta_key, m.meta_value ?? "");
    if (m.meta_key === "_thumbnail_id" && m.meta_value) attachmentIds.add(Number(m.meta_value));
    if (m.meta_key === "_product_image_gallery" && m.meta_value) {
      for (const part of m.meta_value.split(",")) {
        const n = Number(part.trim());
        if (n) attachmentIds.add(n);
      }
    }
  }

  const lookupByProduct = new Map(lookups.map((l) => [toNumber(l.product_id), l]));
  const termById = new Map(terms.map((t) => [toNumber(t.term_id), t]));
  const ttById = new Map(taxonomies.map((c) => [toNumber(c.term_taxonomy_id), c]));
  const catsByProduct = new Map<number, Category[]>();
  for (const rel of relationships) {
    const pid = toNumber(rel.object_id);
    const tt = ttById.get(toNumber(rel.term_taxonomy_id));
    if (!tt) continue;
    const term = termById.get(toNumber(tt.term_id));
    if (!term) continue;
    if (toNumber(tt.term_id) === 15) continue; // Uncategorized
    const cat: Category = {
      id: toNumber(tt.term_id),
      name: htmlDecode(term.name),
      slug: term.slug,
      count: toNumber(tt.count),
      parent: toNumber(tt.parent),
    };
    if (!catsByProduct.has(pid)) catsByProduct.set(pid, []);
    catsByProduct.get(pid)!.push(cat);
  }

  const media = await mediaUrls([...attachmentIds]);

  return posts.map((p) => {
    const id = toNumber(p.ID);
    const meta = metaByPost.get(id) ?? new Map<string, string>();
    const lookup = lookupByProduct.get(id);
    const regular = Number(meta.get("_regular_price") || lookup?.min_price || 0);
    const sale = Number(meta.get("_sale_price") || 0);
    const minPrice = toNumber(lookup?.min_price);
    const onSale = Boolean(lookup?.onsale) || (sale > 0 && sale < regular);
    const price = onSale && sale > 0 ? sale : minPrice || regular;
    const thumbId = Number(meta.get("_thumbnail_id") || 0);
    const gallery = (meta.get("_product_image_gallery") || "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter(Boolean)
      .map((gid) => media.get(gid))
      .filter((u): u is string => Boolean(u));

    return {
      id,
      slug: p.post_name,
      name: htmlDecode(p.post_title),
      excerpt: cleanContent(htmlDecode(p.post_excerpt)),
      description: cleanContent(p.post_content),
      price,
      regularPrice: regular || price,
      salePrice: onSale && sale > 0 ? sale : null,
      onSale,
      sku: meta.get("_sku") || lookup?.sku || "",
      stockStatus: lookup?.stock_status || "instock",
      stockQuantity: lookup?.stock_quantity ?? null,
      rating: Number(lookup?.average_rating ?? 0),
      reviewCount: toNumber(lookup?.rating_count),
      totalSales: toNumber(lookup?.total_sales),
      image: media.get(thumbId) ?? gallery[0] ?? PLACEHOLDER,
      gallery,
      categories: catsByProduct.get(id) ?? [],
    };
  });
}

export type ProductQuery = {
  categorySlug?: string;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular" | "rating";
  page?: number;
  perPage?: number;
  onSale?: boolean;
  inStock?: boolean;
};

export async function getProducts(query: ProductQuery = {}): Promise<{
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}> {
  const perPage = Math.min(48, Math.max(1, query.perPage ?? 12));
  const page = Math.max(1, query.page ?? 1);
  let products = await loadAllProducts();

  if (query.categorySlug) {
    products = products.filter((p) => p.categories.some((c) => c.slug === query.categorySlug));
  }
  if (query.onSale) products = products.filter((p) => p.onSale);
  if (query.inStock) products = products.filter((p) => p.stockStatus === "instock");
  if (query.search) {
    const needle = query.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.sku.toLowerCase().includes(needle) ||
        p.excerpt.toLowerCase().includes(needle),
    );
  }

  switch (query.sort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "popular":
      products.sort((a, b) => b.totalSales - a.totalSales);
      break;
    default:
      products.sort((a, b) => b.id - a.id);
  }

  const total = products.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  return { items: products.slice(start, start + perPage), total, page, perPage, pages };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await loadAllProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const products = await loadAllProducts();
  const wanted = new Set(ids);
  return products.filter((p) => wanted.has(p.id));
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const slugs = new Set(product.categories.map((c) => c.slug));
  const products = await loadAllProducts();
  const related = products.filter(
    (p) => p.id !== product.id && p.categories.some((c) => slugs.has(c.slug)),
  );
  if (related.length >= limit) return related.slice(0, limit);
  const extra = products.filter((p) => p.id !== product.id && !related.includes(p));
  return [...related, ...extra].slice(0, limit);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await loadAllProducts();
  const onSale = products.filter((p) => p.onSale);
  return (onSale.length >= limit ? onSale : products).slice(0, limit);
}

export async function getPages(): Promise<ContentPage[]> {
  const rows = await prisma.wp_posts.findMany({
    where: { post_type: "page", post_status: "publish" },
    select: { ID: true, post_name: true, post_title: true, post_content: true, post_modified: true },
  });
  return rows.map((r) => ({
    id: toNumber(r.ID),
    slug: r.post_name,
    title: htmlDecode(r.post_title),
    content: cleanContent(r.post_content),
    updated: r.post_modified,
  }));
}

export async function getPageBySlug(slug: string): Promise<ContentPage | null> {
  const pages = await getPages();
  return pages.find((p) => p.slug === slug) ?? null;
}

export async function getPosts(limit?: number): Promise<BlogPost[]> {
  const rows = await prisma.wp_posts.findMany({
    where: { post_type: "post", post_status: "publish" },
    select: { ID: true, post_name: true, post_title: true, post_excerpt: true, post_content: true, post_date: true },
    orderBy: { post_date: "desc" },
    take: limit,
  });
  const thumbIds: number[] = [];
  const metas = rows.length
    ? await prisma.wp_postmeta.findMany({
        where: { post_id: { in: rows.map((r) => r.ID) }, meta_key: "_thumbnail_id" },
        select: { post_id: true, meta_value: true },
      })
    : [];
  for (const m of metas) if (m.meta_value) thumbIds.push(Number(m.meta_value));
  const media = await mediaUrls(thumbIds);
  const thumbByPost = new Map(metas.map((m) => [toNumber(m.post_id), Number(m.meta_value || 0)]));

  return rows.map((r) => {
    const thumb = thumbByPost.get(toNumber(r.ID)) ?? 0;
    return {
      id: toNumber(r.ID),
      slug: r.post_name,
      title: htmlDecode(r.post_title),
      excerpt: cleanContent(htmlDecode(r.post_excerpt)),
      content: cleanContent(r.post_content),
      date: r.post_date,
      image: media.get(thumb) ?? null,
    };
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
