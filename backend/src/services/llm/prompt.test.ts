import { describe, expect, it } from 'vitest';
import type { KnowledgeItem } from '@prisma/client';
import { buildMessages, buildSystemPrompt } from './prompt.js';
import type { ChatMessage } from '../../types/index.js';

function fakeItem(over: Partial<KnowledgeItem>): KnowledgeItem {
  return {
    id: 'k1',
    topic: 'shipping',
    question: 'Do you ship to the USA?',
    answer: 'Yes, we ship across the USA.',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

describe('buildSystemPrompt', () => {
  it('injects the store knowledge into the prompt', () => {
    const prompt = buildSystemPrompt([
      fakeItem({ question: 'Do you ship to the USA?', answer: 'Yes, we ship across the USA.' }),
      fakeItem({ id: 'k2', topic: 'returns', question: 'Return policy?', answer: '30-day returns.' }),
    ]);

    expect(prompt).toContain('Aura Living');
    expect(prompt).toContain('Do you ship to the USA?');
    expect(prompt).toContain('Yes, we ship across the USA.');
    expect(prompt).toContain('30-day returns.');
    expect(prompt).toContain('STORE KNOWLEDGE');
  });

  it('degrades gracefully with no knowledge', () => {
    const prompt = buildSystemPrompt([]);
    expect(prompt).toContain('No FAQ entries are loaded');
    expect(prompt).toContain('connect');
  });
});

describe('buildMessages', () => {
  it('orders system → history → new user message', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello!' },
    ];
    const messages = buildMessages('SYSTEM_PROMPT', history, 'what are your hours?');

    expect(messages).toHaveLength(4);
    expect(messages[0]).toEqual({ role: 'system', content: 'SYSTEM_PROMPT' });
    expect(messages[1]).toEqual({ role: 'user', content: 'hi' });
    expect(messages[messages.length - 1]).toEqual({
      role: 'user',
      content: 'what are your hours?',
    });
  });
});
