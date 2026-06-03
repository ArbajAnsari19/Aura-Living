import type { NextFunction, Request, Response } from 'express';
import { redis, isRedisReady } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { RateLimitError } from '../lib/errors.js';

interface RateLimitOptions {
  windowSec: number;
  max: number;
  /** Derives the rate-limit key from the request (defaults to sessionId|IP). */
  keyFn?: (req: Request) => string;
}

// ── In-memory fallback (used when Redis is down) ────────────────────
const memStore = new Map<string, { count: number; resetAt: number }>();

function memHit(key: string, windowSec: number, max: number): boolean {
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || entry.resetAt <= now) {
    memStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

// Periodically evict expired entries so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of memStore) if (v.resetAt <= now) memStore.delete(k);
}, 60_000).unref();

function defaultKey(req: Request): string {
  const sessionId =
    (req.body && typeof req.body.sessionId === 'string' && req.body.sessionId) || null;
  return sessionId ? `sid:${sessionId}` : `ip:${req.ip}`;
}

/**
 * Fixed-window rate limiter. Prefers Redis (shared across instances) and falls
 * back to an in-memory counter so the app keeps working without Redis.
 */
export function rateLimit(opts: RateLimitOptions) {
  const { windowSec, max, keyFn = defaultKey } = opts;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const key = `ratelimit:${keyFn(req)}`;
    try {
      let allowed: boolean;

      if (isRedisReady() && redis) {
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, windowSec);
        allowed = count <= max;
      } else {
        allowed = memHit(key, windowSec, max);
      }

      if (!allowed) throw new RateLimitError();
      next();
    } catch (err) {
      if (err instanceof RateLimitError) return next(err);
      // Never let a limiter glitch block traffic — log and allow.
      logger.warn({ err }, 'Rate limiter error — allowing request');
      next();
    }
  };
}
