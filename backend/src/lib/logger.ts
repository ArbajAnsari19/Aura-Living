import pino from 'pino';
import { env, isProd, isTest } from '../config/env.js';

/**
 * Structured logger. Pretty-printed in dev, JSON in prod, silent-ish in tests
 * (no pretty-transport worker, which is awkward under the test runner).
 */
export const logger = pino({
  level: isTest ? 'silent' : isProd ? 'info' : 'debug',
  ...(isProd || isTest
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }),
  base: { env: env.NODE_ENV },
});
