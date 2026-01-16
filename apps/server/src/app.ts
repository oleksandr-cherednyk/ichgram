import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config';

export const createApp = (): express.Express => {
  const app = express();

  // Core security and request parsing middleware.
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());

  const corsOptions: CorsOptions = {
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  };

  // CORS must be global for cookie-based auth to work in browsers.
  app.use(cors(corsOptions));

  return app;
};
