import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

/**
 * Single source of truth for configuration. Validated at boot so the process
 * fails fast (with a clear message) instead of crashing deep inside a request
 * handler when an env var is missing or malformed.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),

  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid postgres URL' }),
  REDIS_URL: z.string().url().optional(),

  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  LLM_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(600),
  LLM_HISTORY_WINDOW: z.coerce.number().int().positive().default(20),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),

  MAX_MESSAGE_LENGTH: z.coerce.number().int().positive().default(4000),
  RATE_LIMIT_WINDOW_SEC: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
