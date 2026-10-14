import { connection } from "next/server";

import { AdminSection } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { LanguageGrid } from "./language-grid";

export const instant = false;

// Livewire `LanguageManager::$paginate`.
const PER_PAGE = 12;

export default async function LanguageIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  await connection();
  await getCurrentUser();

  const { page: pageParam, search } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const term = (search ?? "").trim();

  const where = term ? { name: { contains: term } } : {};

  const [languages, total] = await Promise.all([
    prisma.languages.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.languages.count({ where }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminSection title="Languages">
      <div className="card">
        <div className="card-body">
          <LanguageGrid
            languages={languages.map((language) => ({
              id: language.id,
              name: language.name,
              description: language.description,
            }))}
            term={term}
            currentPage={page}
            lastPage={lastPage}
            total={total}
            perPage={PER_PAGE}
          />
        </div>
      </div>
    </AdminSection>
  );
}
