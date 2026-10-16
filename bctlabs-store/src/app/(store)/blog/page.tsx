import type { Metadata } from "next";

import { PostCard } from "@/components/post-card";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { getPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog",
    description:
      "Guides, project ideas and product news from the BCTLABS workshop - electronic components, sensors, modules and STEM kits.",
  };
}

export default async function BlogPage() {
  const posts = await getPosts(24);

  return (
    <Container className="py-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Blog</h1>
        <p className="mt-3 text-base text-slate-500">
          Build guides, project ideas and product news from the BCTLABS workshop.
        </p>
      </header>

      <section className="mt-8">
        {posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="We are busy writing our first articles. Check back soon or explore the shop in the meantime."
            action={<ButtonLink href="/shop">Browse products</ButtonLink>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
