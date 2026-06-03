import type { Sender } from '@prisma/client';

/** A single turn in a conversation, as exposed to the LLM and the API. */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Message shape returned to the frontend. */
export interface MessageDTO {
  id: string;
  sender: Sender;
  text: string;
  createdAt: string;
}

export interface ChatMessageResponse {
  reply: string;
  sessionId: string;
  /** True when the user's input was truncated to MAX_MESSAGE_LENGTH. */
  truncated?: boolean;
}

export interface ConversationHistoryResponse {
  sessionId: string;
  messages: MessageDTO[];
}
