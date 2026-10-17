import Link from "next/link";
import type { BlogPost } from "@/lib/store";
import { cleanContent, formatDate, truncate } from "@/lib/format";

export function PostCard({ post }: { post: BlogPost }) {
  const excerpt = truncate(post.excerpt || cleanContent(post.content), 140);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-50">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 via-brand-500 to-ink-900">
            <span className="text-2xl font-black uppercase tracking-wider text-white/90">
              {post.title.slice(0, 2)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {formatDate(post.date) ? (
          <time
            dateTime={post.date ? post.date.toISOString() : undefined}
            className="text-xs font-medium uppercase tracking-wide text-brand-600"
          >
            {formatDate(post.date)}
          </time>
        ) : null}
        <h2 className="mt-1 line-clamp-2 font-semibold leading-snug text-slate-800 group-hover:text-brand-700">
          {post.title}
        </h2>
        {excerpt ? <p className="mt-2 line-clamp-3 text-sm text-slate-500">{excerpt}</p> : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          Read article
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
