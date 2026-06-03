import { logger } from '../../lib/logger.js';
import { LLMError } from '../../lib/errors.js';

/** Duck-typed shape of provider errors (OpenAI SDK errors expose `.status`). */
interface MaybeApiError {
  status?: number;
  code?: string;
  name?: string;
  message?: string;
}

function isTimeout(err: MaybeApiError): boolean {
  const name = err.name ?? '';
  const message = err.message ?? '';
  return (
    name === 'APIConnectionTimeoutError' ||
    name === 'AbortError' ||
    /timeout|timed out|ETIMEDOUT/i.test(message)
  );
}

/**
 * Maps any provider/network error to a friendly, user-safe `LLMError`.
 * Internals are logged here; only `userMessage` is ever exposed to the client.
 * Pure and duck-typed so it's trivial to unit-test without the OpenAI SDK.
 */
export function toFriendlyLLMError(err: unknown): LLMError {
  if (err instanceof LLMError) return err;

  const e = (err ?? {}) as MaybeApiError;
  const status = typeof e.status === 'number' ? e.status : undefined;

  let userMessage = "Sorry, I'm having trouble responding right now. Please try again in a moment.";

  if (status === 401 || status === 403) {
    userMessage =
      'The support assistant is temporarily unavailable. Please contact us at support@aura-living.example.';
    logger.error({ status, code: e.code }, 'OpenAI auth/config error — check OPENAI_API_KEY');
  } else if (status === 429) {
    userMessage = "I'm getting a lot of questions right now — please try again in a few seconds.";
    logger.warn({ status }, 'OpenAI rate limit / quota hit');
  } else if (status !== undefined && status >= 500) {
    userMessage =
      'The AI service is having a hiccup. Please try again shortly, or reach us at support@aura-living.example.';
    logger.error({ status }, 'OpenAI upstream error');
  } else if (isTimeout(e)) {
    userMessage = 'That took longer than expected. Please try again.';
    logger.warn('OpenAI request timed out');
  } else {
    logger.error({ err }, 'Unexpected LLM error');
  }

  return new LLMError(userMessage, err);
}
