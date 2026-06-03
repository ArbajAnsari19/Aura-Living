import { pinoHttp } from 'pino-http';
import { logger } from '../lib/logger.js';

/** HTTP request logging bound to our pino logger. Quiet on health checks. */
export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/api/health',
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
