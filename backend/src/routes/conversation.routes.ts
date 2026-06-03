import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getHistory } from '../controllers/conversation.controller.js';

const router = Router();

router.get('/:sessionId/messages', asyncHandler(getHistory));

export default router;
