import { afterAll, afterEach, beforeAll } from 'vitest';
import mongoose from 'mongoose';

import { connectToDatabase } from '../../config';
import { cleanAll } from './seed';

export const setupTestDb = () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterEach(async () => {
    await cleanAll();
  });

  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.connection.close();
  });
};
