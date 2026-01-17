import { Router } from 'express';

import { login, logout, me, refresh, register } from '../controllers';
import { requireAuth, validate } from '../middlewares';
import { loginSchema, refreshSchema, registerSchema } from '../validations';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', validate({ body: refreshSchema }), refresh);
authRouter.get('/me', requireAuth, me);
