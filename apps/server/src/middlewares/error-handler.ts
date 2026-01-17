import { type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';

import { type ApiErrorPayload } from '../utils';

export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

const buildPayload = (
  error: ApiError,
  requestId?: string,
): ApiErrorPayload => ({
  error: {
    code: error.code,
    message: error.message,
    details: error.details,
    requestId,
  },
});

export const errorHandler = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    const payload = buildPayload(
      {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.flatten(),
      },
      request.requestId,
    );

    response.status(400).json(payload);
    return;
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const apiError = error as ApiError;
    const payload = buildPayload(apiError, request.requestId);

    response.status(apiError.status).json(payload);
    return;
  }

  const payload = buildPayload(
    {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
    },
    request.requestId,
  );

  response.status(500).json(payload);
};
