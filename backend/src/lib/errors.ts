/**
 * Application error taxonomy. Anything thrown as an `AppError` is considered
 * "expected" — the central error handler maps it to a clean JSON response with
 * the given status. Anything else is treated as a 500 and its details are never
 * leaked to the client.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests — please slow down.') {
    super(429, message, 'RATE_LIMITED');
  }
}

/**
 * Raised by the LLM layer. Carries a `userMessage` that is SAFE to show the end
 * user. The underlying `cause` is kept for server-side logging only and is NEVER
 * placed in `details` (which can be serialized to the client).
 */
export class LLMError extends AppError {
  constructor(
    public readonly userMessage: string,
    /** Underlying provider/network error — logged server-side, never serialized. */
    public readonly providerError?: unknown,
  ) {
    super(502, userMessage, 'LLM_ERROR'); // no details → nothing provider-internal leaks
  }
}
