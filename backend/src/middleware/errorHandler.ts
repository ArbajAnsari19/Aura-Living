import type { NextFunction, Request, Response } from 'express';
import { AppError, LLMError, ValidationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

/** 404 for unmatched routes. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Cannot ${req.method} ${req.path}` } });
}

/**
 * Central error handler. Maps known AppErrors to their status + safe message;
 * treats everything else as a 500 without leaking internals. The process is
 * never crashed by a request error.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Body-parser errors (e.g. payload too large / malformed JSON).
  if (isHttpBodyError(err)) {
    res.status(err.status).json({
      error: { code: 'BAD_REQUEST', message: friendlyBodyError(err.status) },
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err }, err.message);
    else logger.debug({ code: err.code }, err.message);

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        // LLMError.userMessage is already safe; other AppErrors carry safe messages too.
        message: err instanceof LLMError ? err.userMessage : err.message,
        // Only validation errors expose details (safe field info). Never leak
        // provider/internal causes (e.g. LLMError.cause) to the client.
        ...(err instanceof ValidationError && err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our end. Please try again.' },
  });
}

function isHttpBodyError(err: unknown): err is { status: number; type?: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof (err as { status: unknown }).status === 'number' &&
    'type' in err
  );
}

function friendlyBodyError(status: number): string {
  if (status === 413) return 'Your message is too large. Please shorten it and try again.';
  return 'We could not read that request. Please try again.';
}
