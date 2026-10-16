import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Container } from "@/components/ui";
import { cleanContent, formatDate, isPlaceholderContent, truncate } from "@/lib/format";
import { getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Tailwind typography utilities applied to raw WordPress HTML. */
const CONTENT_CLASS =
  "text-[15px] leading-relaxed text-slate-600 [&_p]:mb-4 [&_p]:leading-relaxed [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:font-semibold [&_h4]:text-slate-900 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-brand-300 hover:[&_a]:text-brand-700 [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_table]:my-4 [&_table]:w-full [&_td]:border-b [&_td]:border-slate-100 [&_td]:py-2 [&_th]:border-b [&_th]:border-slate-200 [&_th]:py-2 [&_th]:text-left [&_strong]:font-semibold [&_strong]:text-slate-800";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Page not found" };
  const realContent = !isPlaceholderContent(page.content);
  return {
    title: page.title,
    description: realContent ? truncate(page.content, 160) : `${page.title} - BCTLABS.`,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const updated = formatDate(page.updated);
  const hasRealContent = !isPlaceholderContent(page.content);
  const body = hasRealContent ? cleanContent(page.content) : "";

  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-brand-700">
          Home
        </Link>
        <span aria-hidden="true" className="text-slate-300">
          /
        </span>
        <span aria-current="page" className="max-w-[20rem] truncate font-medium text-slate-900">
          {page.title}
        </span>
      </nav>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <header className="border-b border-slate-100 pb-5">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{page.title}</h1>
          {updated ? (
            <p className="mt-2 text-sm text-slate-500">Last updated {updated}</p>
          ) : null}
        </header>

        {body ? (
          <div className={`mt-6 ${CONTENT_CLASS}`} dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-medium text-slate-800">This page is being updated.</p>
            <p className="mt-1">
              The full {page.title.toLowerCase()} content will be published shortly. In the
              meantime, please <Link href="/contact-us" className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700">contact us</Link>{" "}
              with any questions.
            </p>
          </div>
        )}
      </article>
    </Container>
  );
}
