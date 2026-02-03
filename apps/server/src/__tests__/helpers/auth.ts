import request from 'supertest';
import type { Express } from 'express';

export const registerAndLogin = async (
  app: Express,
  overrides: Partial<{
    email: string;
    username: string;
    fullName: string;
    password: string;
  }> = {},
) => {
  const payload = {
    email: overrides.email ?? 'user@test.com',
    username: overrides.username ?? 'testuser',
    fullName: overrides.fullName ?? 'Test User',
    password: overrides.password ?? 'password123',
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(payload)
    .expect(201);

  return {
    accessToken: res.body.accessToken as string,
    user: res.body.user as { id: string; username: string; email: string },
    cookies: res.headers['set-cookie'] as unknown as string[] | undefined,
  };
};
