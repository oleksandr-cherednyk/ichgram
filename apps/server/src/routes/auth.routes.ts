import { Router } from 'express';

import { login, logout, me, refresh, register } from '../controllers';
import { env } from '../config';
import { createRateLimiter, requireAuth, validate } from '../middlewares';
import { loginSchema, refreshSchema, registerSchema } from '../validations';

export const authRouter = Router();

const authLimiter = createRateLimiter({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
});

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  register,
);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), login);
authRouter.post('/logout', logout);
authRouter.post(
  '/refresh',
  authLimiter,
  validate({ body: refreshSchema }),
  refresh,
);
authRouter.get('/me', requireAuth, me);
