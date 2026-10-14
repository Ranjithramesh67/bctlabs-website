import { TranslationManager } from "@/components/admin/translation-manager";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * `TranslationManagerController::index`.
 *
 * The Laravel page used a server-side DataTable that fetched JSON from the
 * same route. jQuery/DataTables are not part of the React shell, so the rows
 * are rendered on the server instead. The table id, columns, header labels and
 * action buttons match the original markup, and the ordering mirrors
 * `Language::query()->latest()`.
 */
export default async function TranslationManagerIndexPage() {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  await getCurrentUser();

  const languages = await prisma.languages.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <TranslationManager
      languages={languages.map((language) => ({
        id: language.id,
        name: language.name,
      }))}
    />
  );
}
