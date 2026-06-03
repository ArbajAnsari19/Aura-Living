import { PrismaClient } from '@prisma/client';
import { isProd } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Singleton PrismaClient. In dev, `tsx watch` reloads the module graph on every
 * change; caching on globalThis prevents exhausting the DB connection pool with
 * a new client per reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['error', 'warn'],
  });

if (!isProd) globalForPrisma.prisma = prisma;

export async function checkDbHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, 'Database health check failed');
    return false;
  }
}
