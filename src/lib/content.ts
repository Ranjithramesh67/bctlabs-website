import "server-only";

import { prisma } from "./prisma";
import { applyCustomStylesToContent } from "./html-content";

/**
 * Prisma `orderBy` that reproduces Laravel's `orderBy('orderby_no', 'ASC')`
 * on MySQL, where NULLs sort first.
 */
const BY_ORDER = { orderby_no: { sort: "asc", nulls: "first" } } as const;

export type FrontendEvent = {
  id: number;
  title: string;
  type: string;
  mainImage: string;
  startImage: string;
  middleImage: string | null;
  endImage: string | null;
  image4: string | null;
  image5: string | null;
  image6: string | null;
  content: string | null;
  mainContent: string | null;
  date: string | null;
  venue: string | null;
  authorName: string | null;
  categoryId: number | null;
  price: string;
  createdAt: string | null;
};

type EventRow = {
  id: bigint;
  title: string;
  type: string;
  main_image: string;
  start_image: string;
  middle_image: string | null;
  end_image: string | null;
  image_4: string | null;
  image_5: string | null;
  image_6: string | null;
  content: string | null;
  main_condent: string | null;
  date: string | null;
  venue: string | null;
  author_name: string | null;
  category_id: bigint | null;
  price: { toString(): string } | number | string;
  created_at: Date | null;
};

function toEvent(row: EventRow): FrontendEvent {
  return {
    id: Number(row.id),
    title: row.title,
    type: row.type,
    mainImage: row.main_image,
    startImage: row.start_image,
    middleImage: row.middle_image,
    endImage: row.end_image,
    image4: row.image_4,
    image5: row.image_5,
    image6: row.image_6,
    content: row.content,
    mainContent: row.main_condent,
    date: row.date,
    venue: row.venue,
    authorName: row.author_name,
    categoryId: row.category_id === null ? null : Number(row.category_id),
    price: row.price.toString(),
    createdAt: row.created_at ? row.created_at.toISOString() : null,
  };
}

const EVENT_SELECT = {
  id: true,
  title: true,
  type: true,
  main_image: true,
  start_image: true,
  middle_image: true,
  end_image: true,
  image_4: true,
  image_5: true,
  image_6: true,
  content: true,
  main_condent: true,
  date: true,
  venue: true,
  author_name: true,
  category_id: true,
  price: true,
  created_at: true,
} as const;

/** Published events of a given `type`, ordered exactly like the original. */
export async function getEventsByType(type: string): Promise<FrontendEvent[]> {
  const rows = await prisma.events.findMany({
    where: { type, is_deleted: 0 },
    orderBy: BY_ORDER,
    select: EVENT_SELECT,
  });
  return rows.map(toEvent);
}

/** Blog posts, optionally narrowed to a category. Ordered ascending by `orderby_no`. */
export async function getBlogPosts(categoryId?: number): Promise<FrontendEvent[]> {
  const rows = await prisma.events.findMany({
    where: {
      type: "blog",
      is_deleted: 0,
      ...(categoryId ? { category_id: BigInt(categoryId) } : {}),
    },
    orderBy: BY_ORDER,
    select: EVENT_SELECT,
  });
  return rows.map(toEvent);
}

/** The five most recent blog posts (`orderby_no` DESC), for the sidebar. */
export async function getRecentBlogPosts(): Promise<FrontendEvent[]> {
  const rows = await prisma.events.findMany({
    where: { type: "blog", is_deleted: 0 },
    orderBy: { orderby_no: { sort: "desc", nulls: "last" } },
    take: 5,
    select: EVENT_SELECT,
  });
  return rows.map(toEvent);
}

export type BlogCategory = {
  id: number;
  name: string;
  totalCount: number;
};

/** Blog categories with their published post counts. */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const categories = await prisma.blog_categories.findMany({
    orderBy: { id: "asc" },
    select: { id: true, blog_category_name: true },
  });

  return Promise.all(
    categories.map(async (category) => ({
      id: Number(category.id),
      name: category.blog_category_name,
      totalCount: await prisma.events.count({
        where: { type: "blog", is_deleted: 0, category_id: category.id },
      }),
    })),
  );
}

/**
 * A single event with `styledContent` applied, matching
 * `FrontendController::single_event` / `single_product`.
 */
export async function getEventWithStyledContent(
  id: number,
): Promise<(FrontendEvent & { styledContent: string | null }) | null> {
  const row = await prisma.events.findUnique({
    where: { id: BigInt(id) },
    select: EVENT_SELECT,
  });
  if (!row) {
    return null;
  }

  const event = toEvent(row);
  return {
    ...event,
    styledContent: event.content ? applyCustomStylesToContent(event.content) : null,
  };
}

/**
 * Resolve `category_name` for the given category ids, matching the Blade's
 * `\App\Models\Category::find($event->category_id)` lookups.
 */
export async function getCategoryNames(
  ids: number[],
): Promise<Map<number, string>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) {
    return new Map();
  }
  const rows = await prisma.categories.findMany({
    where: { id: { in: unique } },
    select: { id: true, category_name: true },
  });
  return new Map(rows.map((row) => [row.id, row.category_name]));
}
