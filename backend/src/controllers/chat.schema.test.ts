import { describe, expect, it } from 'vitest';
import { chatMessageSchema } from './chat.controller.js';

describe('chatMessageSchema', () => {
  it('rejects an empty message', () => {
    expect(chatMessageSchema.safeParse({ message: '' }).success).toBe(false);
  });

  it('rejects a whitespace-only message', () => {
    expect(chatMessageSchema.safeParse({ message: '    ' }).success).toBe(false);
  });

  it('rejects a missing message', () => {
    expect(chatMessageSchema.safeParse({}).success).toBe(false);
  });

  it('trims surrounding whitespace', () => {
    const parsed = chatMessageSchema.parse({ message: '  hello  ' });
    expect(parsed.message).toBe('hello');
  });

  it('accepts a valid message with optional sessionId', () => {
    const parsed = chatMessageSchema.parse({ message: 'hi', sessionId: 'abc-123' });
    expect(parsed).toEqual({ message: 'hi', sessionId: 'abc-123' });
  });

  it('accepts very long input (truncation happens later, not here)', () => {
    const parsed = chatMessageSchema.safeParse({ message: 'x'.repeat(10_000) });
    expect(parsed.success).toBe(true);
  });
});
