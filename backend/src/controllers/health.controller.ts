import type { Request, Response } from 'express';
import { checkDbHealth } from '../lib/prisma.js';
import { isRedisReady } from '../lib/redis.js';

/** GET /api/health — liveness + dependency status. */
export async function getHealth(_req: Request, res: Response): Promise<void> {
  const db = await checkDbHealth();
  const redis = isRedisReady();
  // DB is required; Redis is best-effort, so it doesn't fail the healthcheck.
  res.status(db ? 200 : 503).json({
    status: db ? 'ok' : 'degraded',
    db: db ? 'up' : 'down',
    redis: redis ? 'up' : 'down (using in-memory fallback)',
    timestamp: new Date().toISOString(),
  });
}
