import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { CitiesGrid } from "../cities-grid";

export const instant = false;

// Livewire `Cities::$paginate`.
const PER_PAGE = 12;

export default async function CitiesIndexPage({
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
  const stateId = Number(id);

  if (!Number.isInteger(stateId) || stateId <= 0) {
    notFound();
  }

  const state = await prisma.states.findUnique({ where: { id: stateId } });
  if (!state) {
    notFound();
  }

  const page = Math.max(1, Number(pageParam) || 1);
  const term = (search ?? "").trim();

  const where = {
    state_id: stateId,
    ...(term ? { name: { contains: term } } : {}),
  };

  const [cities, total, states] = await Promise.all([
    prisma.cities.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.cities.count({ where }),
    prisma.states.findMany({ orderBy: { name: "asc" } }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminSection title="Cities">
      <div className="card">
        <div className="card-body">
          <CitiesGrid
            cities={cities.map((city) => ({
              id: city.id,
              name: city.name,
              state_id: city.state_id,
            }))}
            states={states.map((option) => ({
              id: option.id,
              name: option.name,
            }))}
            stateId={stateId}
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
