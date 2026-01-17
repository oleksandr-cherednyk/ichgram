import { type NextFunction, type Request, type Response } from 'express';
import rateLimit, {
  type Options,
  type RateLimitExceededEventHandler,
} from 'express-rate-limit';

import { type ApiErrorPayload } from '../utils';

type RateLimitConfig = {
  windowMs: number;
  max: number;
};

const buildPayload = (requestId?: string): ApiErrorPayload => ({
  error: {
    code: 'RATE_LIMITED',
    message: 'Too many requests',
    requestId,
  },
});

const handler: RateLimitExceededEventHandler = (
  request: Request,
  response: Response,
  _next: NextFunction,
  options: Options,
) => {
  response.status(options.statusCode).json(buildPayload(request.requestId));
};

export const createRateLimiter = ({ windowMs, max }: RateLimitConfig) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler,
  });
