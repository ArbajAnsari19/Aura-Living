import { Router } from 'express';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { chatMessageSchema, sendMessage, streamMessage } from '../controllers/chat.controller.js';

const router = Router();

const chatRateLimit = rateLimit({
  windowSec: env.RATE_LIMIT_WINDOW_SEC,
  max: env.RATE_LIMIT_MAX,
});

router.post('/message', chatRateLimit, validateBody(chatMessageSchema), asyncHandler(sendMessage));
router.post('/stream', chatRateLimit, validateBody(chatMessageSchema), asyncHandler(streamMessage));

export default router;
