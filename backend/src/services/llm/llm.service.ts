import type { ChatMessage } from '../../types/index.js';
import { OpenAIProvider } from './openai.provider.js';

/**
 * Provider-agnostic contract for generating support replies. The rest of the app
 * depends only on this interface — swapping OpenAI for Anthropic, or adding a
 * mock for tests, means implementing `LLMProvider` and changing the factory.
 *
 * Signature intentionally matches the assignment's `generateReply(history, userMessage)`.
 * The provider owns prompt construction (system prompt + FAQ injection), so callers
 * never have to know how the model is steered.
 */
export interface LLMProvider {
  /** One-shot reply. */
  generateReply(history: ChatMessage[], userMessage: string): Promise<string>;

  /**
   * Streaming reply. Invokes `onToken` for each delta and resolves with the full
   * accumulated text once complete.
   */
  streamReply(
    history: ChatMessage[],
    userMessage: string,
    onToken: (token: string) => void,
  ): Promise<string>;
}

let provider: LLMProvider | null = null;

/** Returns the configured LLM provider (singleton). */
export function getLLMProvider(): LLMProvider {
  if (!provider) provider = new OpenAIProvider();
  return provider;
}

/** Test seam: inject a mock provider. */
export function setLLMProvider(p: LLMProvider): void {
  provider = p;
}
