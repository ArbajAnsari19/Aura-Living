import type { Request, Response } from 'express';
import { z } from 'zod';
import { getConversationHistory } from '../services/conversation.service.js';
import { ValidationError } from '../lib/errors.js';
import type { ConversationHistoryResponse } from '../types/index.js';

const paramsSchema = z.object({ sessionId: z.string().min(1).max(100) });

/** GET /api/conversations/:sessionId/messages — history for rendering on reload. */
export async function getHistory(req: Request, res: Response): Promise<void> {
  const parsed = paramsSchema.safeParse(req.params);
  if (!parsed.success) throw new ValidationError('Invalid sessionId');

  const messages = await getConversationHistory(parsed.data.sessionId);
  const body: ConversationHistoryResponse = { sessionId: parsed.data.sessionId, messages };
  res.json(body);
}
