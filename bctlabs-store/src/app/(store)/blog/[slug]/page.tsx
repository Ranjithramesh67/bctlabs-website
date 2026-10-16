import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Container } from "@/components/ui";
import { cleanContent, formatDate, truncate } from "@/lib/format";
import { getPostBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const description = truncate(post.excerpt || cleanContent(post.content), 160);
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const body = cleanContent(post.content);
  const excerpt = truncate(post.excerpt || body, 160);

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
            <Link href="/blog" className="transition-colors hover:text-brand-700">
              Blog
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li aria-current="page" className="max-w-[16rem] truncate font-medium text-slate-900">
            {post.title}
          </li>
        </ol>
      </nav>

      <article className="mx-auto mt-6 max-w-3xl">
        <header>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
          {formatDate(post.date) ? (
            <p className="mt-3 text-sm text-slate-500">
              Published{" "}
              <time dateTime={post.date ? post.date.toISOString() : undefined}>
                {formatDate(post.date)}
              </time>
            </p>
          ) : null}
          {excerpt ? <p className="mt-4 text-lg leading-relaxed text-slate-600">{excerpt}</p> : null}
        </header>

        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt={post.title}
            className="mt-8 w-full rounded-2xl border border-slate-200 object-cover"
          />
        ) : null}

        <div
          className="mt-8 text-base leading-relaxed text-slate-700 [&_a]:text-brand-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_img]:my-6 [&_img]:rounded-xl [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-slate-100 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <div className="mt-12 border-t border-slate-200 pt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back to blog
          </Link>
        </div>
      </article>
    </Container>
  );
}
