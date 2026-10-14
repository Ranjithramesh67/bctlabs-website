import type { Metadata } from "next";
import { connection } from "next/server";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard · BCT Labs",
};

export default async function ClientDashboardPage() {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <header className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Welcome, {user.fullName}
          </h1>
          <p className="text-sm text-zinc-500">
            Roles: {user.roles.join(", ") || "none"}
          </p>
        </div>
        <LogoutButton />
      </header>
      <p className="text-sm text-zinc-500">
        Client portal screens are migrated in a later phase.
      </p>
    </main>
  );
}
