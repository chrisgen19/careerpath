import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Prisma 7 requires a driver adapter. We instantiate a single PrismaClient
 * (guarded against hot-reload duplication in development).
 */
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required but is not set.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
