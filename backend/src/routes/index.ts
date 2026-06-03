import { Router } from 'express';
import chatRoutes from './chat.routes.js';
import conversationRoutes from './conversation.routes.js';
import healthRoutes from './health.routes.js';

/** Mounts all API routes under /api. New channels (e.g. /api/whatsapp) plug in here. */
export const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/conversations', conversationRoutes);
