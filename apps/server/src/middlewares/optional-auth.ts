import { type NextFunction, type Request, type Response } from 'express';

import { verifyAccessToken } from '../utils';

/**
 * Optional authentication middleware
 * Sets req.userId if a valid token is provided, but doesn't block the request
 * if no token is present or if the token is invalid
 */
export const optionalAuth = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const header = request.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    // No token provided, continue without setting userId
    next();
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    const subject = payload.sub;

    if (typeof subject === 'string' && subject) {
      request.userId = subject;
    }
  } catch {
    // Invalid token, continue without setting userId
  }

  next();
};
