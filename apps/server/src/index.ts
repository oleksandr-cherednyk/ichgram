import { connectToDatabase, env, registerGracefulShutdown } from './config';

// Bootstraps core infrastructure until the HTTP server is added.
const bootstrap = async (): Promise<void> => {
  await connectToDatabase();
  registerGracefulShutdown();

  console.log(`Database connected. Server placeholder on port ${env.PORT}.`);
};

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
