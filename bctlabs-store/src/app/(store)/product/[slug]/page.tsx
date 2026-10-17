import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { ProductDetails } from "@/components/product-details";
import { ProductGallery } from "@/components/product-gallery";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { cleanContent, truncate } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function stockLabel(status: string, quantity: number | null): string {
  if (status === "instock") return quantity && quantity > 0 ? `In stock (${quantity} available)` : "In stock";
  if (status === "onbackorder") return "Available on backorder";
  if (status === "outofstock") return "Out of stock";
  return status;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const description = truncate(product.excerpt || product.description, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const primaryCategory = product.categories[0];
  const description = cleanContent(product.description);

  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition-colors hover:text-brand-700">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li>
            <Link href="/shop" className="transition-colors hover:text-brand-700">
              Shop
            </Link>
          </li>
          {primaryCategory ? (
            <>
              <li aria-hidden="true" className="text-slate-300">
                /
              </li>
              <li>
                <Link
                  href={`/category/${primaryCategory.slug}`}
                  className="transition-colors hover:text-brand-700"
                >
                  {primaryCategory.name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li aria-current="page" className="max-w-[16rem] truncate font-medium text-slate-900">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery name={product.name} image={product.image} gallery={product.gallery} />
        <ProductDetails product={product} />
      </div>

      <section className="mt-12 space-y-3">
        <details
          open
          className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
            Description
            <svg
              className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="border-t border-slate-100 px-5 py-5">
            {description ? (
              <div
                className="prose-content text-sm"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-sm text-slate-500">No description has been provided for this product.</p>
            )}
          </div>
        </details>

        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
            Additional information
            <svg
              className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="border-t border-slate-100 px-5 py-5">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="w-40 py-3 pr-4 text-left align-top font-medium text-slate-500">SKU</th>
                  <td className="py-3 text-slate-800">{product.sku || "-"}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="w-40 py-3 pr-4 text-left align-top font-medium text-slate-500">
                    Category
                  </th>
                  <td className="py-3 text-slate-800">
                    {product.categories.length ? (
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {product.categories.map((category, index) => (
                          <span key={category.slug} className="flex items-center gap-2">
                            {index > 0 ? <span className="text-slate-300">/</span> : null}
                            <Link
                              href={`/category/${category.slug}`}
                              className="text-brand-600 transition-colors hover:text-brand-700"
                            >
                              {category.name}
                            </Link>
                          </span>
                        ))}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="w-40 py-3 pr-4 text-left align-top font-medium text-slate-500">
                    Stock status
                  </th>
                  <td className="py-3 text-slate-800">
                    {stockLabel(product.stockStatus, product.stockQuantity)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Related products</h2>
            <p className="mt-1 text-sm text-slate-500">You may also like these items.</p>
          </div>
          {primaryCategory ? (
            <Link
              href={`/category/${primaryCategory.slug}`}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              View category
            </Link>
          ) : null}
        </div>

        {related.length ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No related products"
              description="We could not find similar items in this catalogue yet."
              action={<ButtonLink href="/shop">Browse all products</ButtonLink>}
            />
          </div>
        )}
      </section>
    </Container>
  );
}
