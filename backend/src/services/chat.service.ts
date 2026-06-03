import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import type { ChatMessageResponse } from '../types/index.js';
import { getLLMProvider } from './llm/llm.service.js';
import {
  addMessage,
  getOrCreateConversation,
  getRecentHistory,
} from './conversation.service.js';

/** Trims and caps the message. Very long input is truncated (not rejected) so the chat still works. */
export function sanitize(raw: string): { text: string; truncated: boolean } {
  const trimmed = raw.trim();
  if (trimmed.length <= env.MAX_MESSAGE_LENGTH) return { text: trimmed, truncated: false };
  return { text: trimmed.slice(0, env.MAX_MESSAGE_LENGTH), truncated: true };
}

/**
 * Core chat orchestration (channel-agnostic — a WhatsApp/IG route would call this
 * same function). Persists the user turn first so it is never lost, even if the
 * LLM call fails; then generates and persists the AI reply.
 */
export async function processMessage(
  rawMessage: string,
  sessionId?: string,
): Promise<ChatMessageResponse> {
  const { text, truncated } = sanitize(rawMessage);
  const { id } = await getOrCreateConversation(sessionId);

  // History BEFORE this turn = prior context for the model.
  const history = await getRecentHistory(id, env.LLM_HISTORY_WINDOW);

  await addMessage(id, 'USER', text);

  const reply = await getLLMProvider().generateReply(history, text);
  await addMessage(id, 'AI', reply);

  logger.debug({ sessionId: id, truncated }, 'Processed chat message');
  return { reply, sessionId: id, truncated };
}

export interface StreamHandlers {
  /** Fired once the conversation id is known, before the LLM is called. */
  onStart?: (sessionId: string) => void;
  /** Fired for each streamed token. */
  onToken: (token: string) => void;
}

/**
 * Streaming variant. Emits the resolved session id via `onStart` *before* calling
 * the LLM — so the client can persist it even if the reply then fails — then
 * streams tokens, persists the full reply, and returns the final response.
 */
export async function processMessageStream(
  rawMessage: string,
  sessionId: string | undefined,
  handlers: StreamHandlers,
): Promise<ChatMessageResponse> {
  const { text, truncated } = sanitize(rawMessage);
  const { id } = await getOrCreateConversation(sessionId);
  handlers.onStart?.(id);

  const history = await getRecentHistory(id, env.LLM_HISTORY_WINDOW);
  await addMessage(id, 'USER', text);

  const reply = await getLLMProvider().streamReply(history, text, handlers.onToken);
  await addMessage(id, 'AI', reply);

  return { reply, sessionId: id, truncated };
}
