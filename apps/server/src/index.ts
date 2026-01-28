import express from 'express';
import http from 'http';

import { connectToDatabase, env, registerGracefulShutdown } from './config';
import { createApp } from './app';
import { errorHandler } from './middlewares';
import { authRouter, postRouter, userRouter } from './routes';

// Bootstraps core infrastructure before mounting feature routes.
const bootstrap = async (): Promise<void> => {
  await connectToDatabase();
  registerGracefulShutdown();

  const app = createApp();

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/users', userRouter);

  // Serve uploaded images statically
  app.use('/uploads', express.static('uploads'));

  // Error handler must be registered after all routes.
  app.use(errorHandler);

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}.`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
