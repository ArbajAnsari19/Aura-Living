import type { Message, Sender } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { ChatMessage, MessageDTO } from '../types/index.js';
import { NotFoundError } from '../lib/errors.js';

const senderToRole: Record<Sender, ChatMessage['role']> = {
  USER: 'user',
  AI: 'assistant',
  SYSTEM: 'system',
};

function toDTO(m: Message): MessageDTO {
  return {
    id: m.id,
    sender: m.sender,
    text: m.text,
    createdAt: m.createdAt.toISOString(),
  };
}

/**
 * Returns the conversation for `sessionId`, creating a fresh one if the id is
 * missing or unknown. A stale/invalid id from the client never errors — the
 * caller just gets a new conversation id back to store.
 */
export async function getOrCreateConversation(sessionId?: string): Promise<{ id: string }> {
  if (sessionId) {
    const existing = await prisma.conversation.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });
    if (existing) return existing;
  }
  return prisma.conversation.create({ data: {}, select: { id: true } });
}

/** Persists a single message and bumps the conversation's updatedAt. */
export async function addMessage(
  conversationId: string,
  sender: Sender,
  text: string,
): Promise<Message> {
  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { conversationId, sender, text } }),
    prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
  ]);
  return message;
}

/**
 * Recent turns for LLM context, oldest→newest, capped to `window` messages.
 * SYSTEM messages are excluded (the live system prompt is built separately).
 */
export async function getRecentHistory(
  conversationId: string,
  window: number,
): Promise<ChatMessage[]> {
  const rows = await prisma.message.findMany({
    where: { conversationId, sender: { in: ['USER', 'AI'] } },
    orderBy: { createdAt: 'desc' },
    take: window,
  });
  return rows
    .reverse()
    .map((m) => ({ role: senderToRole[m.sender], content: m.text }));
}

/** Full history for rendering on reload. Throws NotFound for an unknown id. */
export async function getConversationHistory(sessionId: string): Promise<MessageDTO[]> {
  const convo = await prisma.conversation.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });
  if (!convo) throw new NotFoundError('Conversation not found');

  const messages = await prisma.message.findMany({
    where: { conversationId: sessionId, sender: { in: ['USER', 'AI'] } },
    orderBy: { createdAt: 'asc' },
  });
  return messages.map(toDTO);
}
