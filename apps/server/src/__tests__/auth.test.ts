import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../app';
import { connectToDatabase } from '../config';
import { errorHandler } from '../middlewares';
import { UserModel } from '../models';
import { authRouter } from '../routes';

const buildTestApp = () => {
  const app = createApp();

  app.use('/api/auth', authRouter);
  app.use(errorHandler);

  return app;
};

describe('auth flow (smoke)', () => {
  const app = buildTestApp();
  const agent = request.agent(app);

  beforeAll(async () => {
    await connectToDatabase();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await UserModel.db.close();
  });

  it('register -> login -> me -> refresh -> logout', async () => {
    const registerPayload = {
      email: 'user@example.com',
      fullName: 'Test User',
      username: 'testuser',
      password: 'password123',
    };

    const registerResponse = await agent
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);

    expect(registerResponse.body.user.email).toBe(registerPayload.email);
    expect(registerResponse.body.accessToken).toBeTypeOf('string');

    const loginResponse = await agent
      .post('/api/auth/login')
      .send({
        email: registerPayload.email,
        password: registerPayload.password,
      })
      .expect(200);

    const accessToken = loginResponse.body.accessToken as string;

    const meResponse = await agent
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meResponse.body.user.username).toBe(registerPayload.username);

    const refreshResponse = await agent
      .post('/api/auth/refresh')
      .send({})
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeTypeOf('string');

    await agent.post('/api/auth/logout').expect(200);
  });
});
