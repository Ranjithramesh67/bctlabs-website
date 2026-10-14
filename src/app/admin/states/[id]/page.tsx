import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { StatesGrid } from "../states-grid";

export const instant = false;

// Livewire `States::$paginate`.
const PER_PAGE = 12;

export default async function StatesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const { id } = await params;
  const { page: pageParam, search } = await searchParams;
  const countryId = Number(id);

  if (!Number.isInteger(countryId) || countryId <= 0) {
    notFound();
  }

  const country = await prisma.countries.findUnique({
    where: { id: countryId },
  });
  if (!country) {
    notFound();
  }

  const page = Math.max(1, Number(pageParam) || 1);
  const term = (search ?? "").trim();

  const where = {
    country_id: countryId,
    ...(term ? { name: { contains: term } } : {}),
  };

  const [states, total, countries] = await Promise.all([
    prisma.states.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.states.count({ where }),
    prisma.countries.findMany({ orderBy: { name: "asc" } }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminSection title="States">
      <div className="card">
        <div className="card-body">
          <StatesGrid
            states={states.map((state) => ({
              id: state.id,
              name: state.name,
              country_id: state.country_id,
            }))}
            countries={countries.map((option) => ({
              id: option.id,
              name: option.name,
            }))}
            countryId={countryId}
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
