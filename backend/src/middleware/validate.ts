import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../lib/errors.js';

/**
 * Generic body validator. On success, replaces req.body with the parsed
 * (typed, coerced) value. On failure, throws a ValidationError that the central
 * error handler turns into a clean 400.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues[0]?.message ?? 'Invalid request body';
        next(new ValidationError(message, err.flatten().fieldErrors));
      } else {
        next(err);
      }
    }
  };
}
