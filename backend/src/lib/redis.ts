import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Redis is BEST-EFFORT. It's used for rate-limiting and caching the FAQ block.
 * If REDIS_URL is unset or the server is unreachable, the app keeps working
 * (rate-limiting falls back to in-memory, FAQ is read fresh from Postgres).
 *
 * `isRedisReady()` lets callers decide at runtime whether to use it.
 */
let client: Redis | null = null;
let ready = false;

if (env.REDIS_URL) {
  client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    // Stop retrying after a few attempts so we don't spam logs when Redis is down.
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
    reconnectOnError: () => false,
  });

  client.on('ready', () => {
    ready = true;
    logger.info('Redis connected');
  });
  client.on('end', () => {
    ready = false;
  });
  client.on('error', (err) => {
    if (ready) logger.warn({ err: err.message }, 'Redis error — degrading gracefully');
    ready = false;
  });

  // Fire-and-forget connect; failures are tolerated.
  client.connect().catch((err) => {
    logger.warn({ err: err.message }, 'Redis unavailable at startup — using in-memory fallbacks');
  });
} else {
  logger.warn('REDIS_URL not set — rate-limiting and caching use in-memory fallbacks');
}

export const redis = client;
export const isRedisReady = (): boolean => ready && client !== null;
