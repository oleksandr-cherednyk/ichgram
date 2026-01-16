import mongoose from 'mongoose';

import { env } from './env';

export const connectToDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
};

export const registerGracefulShutdown = (): void => {
  const shutdown = async (signal: string) => {
    try {
      await mongoose.connection.close();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};
