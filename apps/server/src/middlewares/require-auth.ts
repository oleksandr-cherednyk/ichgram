import { type NextFunction, type Request, type Response } from 'express';

import { createApiError, verifyAccessToken } from '../utils';

const unauthorizedError = createApiError(
  401,
  'UNAUTHORIZED',
  'Authentication required',
);

export const requireAuth = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const header = request.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw unauthorizedError;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    const subject = payload.sub;

    if (typeof subject !== 'string' || !subject) {
      throw unauthorizedError;
    }

    request.userId = subject;
    next();
  } catch {
    throw unauthorizedError;
  }
};
