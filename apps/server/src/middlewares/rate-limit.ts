import { type Request, type Response } from 'express';
import rateLimit, { type RateLimitOptions } from 'express-rate-limit';

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

const handler: RateLimitOptions['handler'] = (
  request: Request,
  response: Response,
  _next,
  options,
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
