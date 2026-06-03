import type { KnowledgeItem } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { redis, isRedisReady } from '../lib/redis.js';
import { logger } from '../lib/logger.js';

const CACHE_KEY = 'knowledge:all';
const CACHE_TTL_SEC = 300; // FAQ rarely changes; 5-min cache cuts DB reads per chat.

/**
 * Returns all FAQ / knowledge items. Cached in Redis when available, always with
 * a safe fallback to a fresh Postgres read. Returning [] (never throwing) keeps
 * the chat flow alive even if the knowledge base is empty or unreachable.
 */
export async function getKnowledge(): Promise<KnowledgeItem[]> {
  if (isRedisReady() && redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return JSON.parse(cached) as KnowledgeItem[];
    } catch (err) {
      logger.warn({ err }, 'Knowledge cache read failed — falling back to DB');
    }
  }

  let items: KnowledgeItem[] = [];
  try {
    items = await prisma.knowledgeItem.findMany({ orderBy: { topic: 'asc' } });
  } catch (err) {
    logger.error({ err }, 'Failed to load knowledge from DB');
    return [];
  }

  if (isRedisReady() && redis) {
    redis
      .set(CACHE_KEY, JSON.stringify(items), 'EX', CACHE_TTL_SEC)
      .catch((err) => logger.warn({ err }, 'Knowledge cache write failed'));
  }

  return items;
}

/** Invalidate the cache after editing knowledge (not wired to an endpoint yet). */
export async function invalidateKnowledgeCache(): Promise<void> {
  if (isRedisReady() && redis) {
    await redis.del(CACHE_KEY).catch(() => undefined);
  }
}
