import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getEnvironment } from "@/backend/config/env";

declare global { var publicPrisma: PrismaClient | undefined; }

export function getPublicPrisma() {
  if (!globalThis.publicPrisma) {
    const adapter = new PrismaPg({ connectionString: getEnvironment().DATABASE_URL });
    globalThis.publicPrisma = new PrismaClient({ adapter });
  }
  return globalThis.publicPrisma;
}
