import { AdminSection } from "@/components/admin/ui";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

import { CountriesGrid } from "./countries-grid";

export const instant = false;

// Livewire `Countries::$paginate`.
const PER_PAGE = 12;

export default async function CountriesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { page: pageParam, search } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const term = (search ?? "").trim();

  const where = term ? { name: { contains: term } } : {};

  const [countries, total] = await Promise.all([
    prisma.countries.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.countries.count({ where }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminSection title={t("countries")}>
      <div className="card">
        <div className="card-body">
          <CountriesGrid
            countries={countries.map((country) => ({
              id: country.id,
              name: country.name,
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
