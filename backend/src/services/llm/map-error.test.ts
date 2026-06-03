import { describe, expect, it } from 'vitest';
import { toFriendlyLLMError } from './map-error.js';
import { LLMError } from '../../lib/errors.js';

describe('toFriendlyLLMError', () => {
  it('maps 401/403 to a config-safe message (no internals leaked)', () => {
    const err = toFriendlyLLMError({ status: 401, message: 'Incorrect API key' });
    expect(err).toBeInstanceOf(LLMError);
    expect(err.statusCode).toBe(502);
    expect(err.userMessage).toMatch(/temporarily unavailable/i);
    expect(err.userMessage).not.toMatch(/api key/i);
  });

  it('maps 429 to a rate-limit message', () => {
    const err = toFriendlyLLMError({ status: 429 });
    expect(err.userMessage).toMatch(/lot of questions|try again/i);
  });

  it('maps 5xx to an upstream-hiccup message', () => {
    const err = toFriendlyLLMError({ status: 503 });
    expect(err.userMessage).toMatch(/hiccup|try again/i);
  });

  it('maps timeouts to a timeout message', () => {
    const err = toFriendlyLLMError({ name: 'APIConnectionTimeoutError', message: 'timed out' });
    expect(err.userMessage).toMatch(/took longer|try again/i);
  });

  it('falls back to a generic message for unknown errors', () => {
    const err = toFriendlyLLMError(new Error('kaboom'));
    expect(err.userMessage).toMatch(/trouble responding/i);
  });

  it('passes through an existing LLMError unchanged', () => {
    const original = new LLMError('custom message');
    expect(toFriendlyLLMError(original)).toBe(original);
  });
});
