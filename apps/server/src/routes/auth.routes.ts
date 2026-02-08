import { Router } from 'express';

import { login, logout, refresh, register } from '../controllers';
import { validate } from '../middlewares';
import { loginSchema, registerSchema } from '../validations';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);
