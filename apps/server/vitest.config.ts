import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['dist/**', 'node_modules/**'],
    testTimeout: 15_000,
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      MONGO_URI: 'mongodb://localhost:27017/ichgram_test',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      CLIENT_ORIGIN: 'http://localhost:3000',
    },
  },
});
