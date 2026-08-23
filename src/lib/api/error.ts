export class OperixApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(
    message: string,
    options: {
      status: number;
      code: string;
      details?: unknown;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "OperixApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details ?? null;
  }
}

export const isOperixApiError = (error: unknown): error is OperixApiError =>
  error instanceof OperixApiError;

export const isAuthRequiredError = (error: unknown): boolean =>
  isOperixApiError(error) && error.status === 401 && error.code === "AUTH_REQUIRED";

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";
