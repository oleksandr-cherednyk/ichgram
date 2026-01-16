import { connectToDatabase, env, registerGracefulShutdown } from './config';

const bootstrap = async (): Promise<void> => {
  await connectToDatabase();
  registerGracefulShutdown();

  console.log(`Database connected. Server placeholder on port ${env.PORT}.`);
};

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
