import express from 'express';
import http from 'http';

import { createApp } from '../../app';
import { errorHandler } from '../../middlewares';
import { authRouter, chatRouter, postRouter, userRouter } from '../../routes';
import { initializeSocket } from '../../sockets';

export const buildTestApp = () => {
  const app = createApp();

  app.use('/api/auth', authRouter);
  app.use('/api/conversations', chatRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/users', userRouter);

  // Serve uploads statically for tests
  app.use('/uploads', express.static('uploads'));

  app.use(errorHandler);

  // Initialize socket.io so controllers that use getIO() don't throw
  const server = http.createServer(app);
  initializeSocket(server);

  return app;
};
