import { randomUUID } from 'crypto';
import { type NextFunction, type Request, type Response } from 'express';

export const requestIdMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const requestId = randomUUID();

  request.requestId = requestId;
  response.setHeader('x-request-id', requestId);

  next();
};
