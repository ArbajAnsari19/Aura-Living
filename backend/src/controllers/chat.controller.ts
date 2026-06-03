import type { Request, Response } from 'express';
import { z } from 'zod';
import { processMessage, processMessageStream } from '../services/chat.service.js';
import { LLMError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

/**
 * Request schema. Empty/whitespace-only messages are rejected here; very long
 * messages are accepted (the service truncates them) so the chat still works.
 * `sessionId` is lenient — an unknown id just starts a fresh conversation.
 */
export const chatMessageSchema = z.object({
  message: z.string({ required_error: 'Message is required' }).trim().min(1, 'Message cannot be empty'),
  sessionId: z.string().max(100).optional(),
});

type ChatBody = z.infer<typeof chatMessageSchema>;

/** POST /api/chat/message — one-shot reply. */
export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { message, sessionId } = req.body as ChatBody;
  const result = await processMessage(message, sessionId);
  res.json(result);
}

/** POST /api/chat/stream — Server-Sent Events token stream. */
export async function streamMessage(req: Request, res: Response): Promise<void> {
  const { message, sessionId } = req.body as ChatBody;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable proxy buffering (e.g. nginx)
  });

  const send = (event: string, data: unknown): void => {
    if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  let clientGone = false;
  req.on('close', () => {
    clientGone = true;
  });

  try {
    const { sessionId: id, truncated } = await processMessageStream(message, sessionId, {
      // Emit the session id immediately so the client can persist it even if the
      // reply subsequently fails (otherwise a failed first turn is unrecoverable).
      onStart: (sid) => {
        if (!clientGone) send('meta', { sessionId: sid });
      },
      onToken: (token) => {
        if (!clientGone) send('token', { token });
      },
    });
    send('done', { sessionId: id, truncated });
  } catch (err) {
    const message =
      err instanceof LLMError
        ? err.userMessage
        : 'Sorry, something went wrong. Please try again.';
    if (!(err instanceof LLMError)) logger.error({ err }, 'Stream error');
    send('error', { message });
  } finally {
    if (!res.writableEnded) res.end();
  }
}
