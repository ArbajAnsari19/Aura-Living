import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { LLMError } from '../../lib/errors.js';
import type { ChatMessage } from '../../types/index.js';
import { getKnowledge } from '../knowledge.service.js';
import { buildMessages, buildSystemPrompt } from './prompt.js';
import { toFriendlyLLMError } from './map-error.js';
import type { LLMProvider } from './llm.service.js';

/**
 * OpenAI implementation of LLMProvider.
 *
 * Cost / safety controls (see README):
 *  - output capped at LLM_MAX_OUTPUT_TOKENS
 *  - per-request timeout (LLM_TIMEOUT_MS) via the SDK
 *  - history is windowed by the caller (chat.service) to LLM_HISTORY_WINDOW turns
 *
 * Every failure is mapped to a friendly, user-safe message; provider internals
 * are logged server-side and never surfaced to the client.
 */
export class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: env.LLM_TIMEOUT_MS,
      maxRetries: 1,
    });
  }

  private async buildPayload(history: ChatMessage[], userMessage: string) {
    const knowledge = await getKnowledge();
    const systemPrompt = buildSystemPrompt(knowledge);
    return buildMessages(systemPrompt, history, userMessage);
  }

  async generateReply(history: ChatMessage[], userMessage: string): Promise<string> {
    const messages = await this.buildPayload(history, userMessage);
    try {
      const completion = await this.client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages,
        max_tokens: env.LLM_MAX_OUTPUT_TOKENS,
        temperature: 0.4,
      });

      const reply = completion.choices[0]?.message?.content?.trim();
      if (!reply) {
        throw new LLMError("I couldn't generate a response just now. Please try again.");
      }
      return reply;
    } catch (err) {
      throw toFriendlyLLMError(err);
    }
  }

  async streamReply(
    history: ChatMessage[],
    userMessage: string,
    onToken: (token: string) => void,
  ): Promise<string> {
    const messages = await this.buildPayload(history, userMessage);
    let full = '';
    try {
      const stream = await this.client.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages,
        max_tokens: env.LLM_MAX_OUTPUT_TOKENS,
        temperature: 0.4,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          full += delta;
          onToken(delta);
        }
      }

      const trimmed = full.trim();
      if (!trimmed) {
        throw new LLMError("I couldn't generate a response just now. Please try again.");
      }
      return trimmed;
    } catch (err) {
      // If we already streamed partial text, surface what we have rather than erroring.
      if (full.trim()) {
        logger.warn({ err }, 'LLM stream errored after partial output');
        return full.trim();
      }
      throw toFriendlyLLMError(err);
    }
  }
}
