import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse a single client across hot reloads in dev so we don't exhaust the pool.
const globalForPrisma = globalThis as unknown as { storePrisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return new PrismaClient({ adapter: new PrismaMariaDb(url) });
}

export const prisma = globalForPrisma.storePrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.storePrisma = prisma;
}
