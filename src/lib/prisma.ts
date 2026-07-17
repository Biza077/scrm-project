import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 requires a driver adapter for SQLite.
// We use better-sqlite3 via @prisma/adapter-better-sqlite3.

const DB_PATH = path.join(process.cwd(), "prisma", "scrm.db");

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: `file:${DB_PATH}` });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

// Prevent multiple Prisma Client instances during Next.js hot-reload in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
