import { describe, expect, it } from 'vitest';
import { sanitize } from './chat.service.js';
import { env } from '../config/env.js';

describe('sanitize', () => {
  it('trims and leaves short messages untouched', () => {
    expect(sanitize('  hello  ')).toEqual({ text: 'hello', truncated: false });
  });

  it('truncates very long messages instead of rejecting them', () => {
    const long = 'a'.repeat(env.MAX_MESSAGE_LENGTH + 500);
    const result = sanitize(long);
    expect(result.truncated).toBe(true);
    expect(result.text).toHaveLength(env.MAX_MESSAGE_LENGTH);
  });

  it('does not flag a message exactly at the limit', () => {
    const exact = 'a'.repeat(env.MAX_MESSAGE_LENGTH);
    expect(sanitize(exact).truncated).toBe(false);
  });
});
