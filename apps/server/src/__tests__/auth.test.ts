import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { buildTestApp } from './helpers/app';
import { registerAndLogin } from './helpers/auth';
import { setupTestDb } from './helpers/setup';

const app = buildTestApp();

describe('auth flow', () => {
  setupTestDb();

  it('register -> login -> me -> refresh -> logout', async () => {
    const agent = request.agent(app);

    const registerRes = await agent
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        fullName: 'Test User',
        username: 'testuser',
        password: 'password123',
      })
      .expect(201);

    expect(registerRes.body.user.email).toBe('user@example.com');
    expect(registerRes.body.accessToken).toBeTypeOf('string');

    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(200);

    const accessToken = loginRes.body.accessToken as string;

    const meRes = await agent
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.user.username).toBe('testuser');

    const refreshRes = await agent
      .post('/api/auth/refresh')
      .send({})
      .expect(200);
    expect(refreshRes.body.accessToken).toBeTypeOf('string');

    await agent.post('/api/auth/logout').expect(200);
  });

  it('rejects duplicate email', async () => {
    await registerAndLogin(app, { email: 'dup@test.com', username: 'first' });

    const res = await request(app).post('/api/auth/register').send({
      email: 'dup@test.com',
      username: 'second',
      fullName: 'Dup',
      password: 'password123',
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects duplicate username', async () => {
    await registerAndLogin(app, {
      email: 'a@test.com',
      username: 'taken',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'b@test.com',
      username: 'taken',
      fullName: 'Dup',
      password: 'password123',
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects wrong password on login', async () => {
    await registerAndLogin(app, {
      email: 'wrong@test.com',
      username: 'wrongpw',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'badpassword' });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('refresh with no cookie returns 401', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(401);
  });

  it('double logout does not crash', async () => {
    const agent = request.agent(app);

    await agent
      .post('/api/auth/register')
      .send({
        email: 'dbl@test.com',
        username: 'dbllogout',
        fullName: 'Dbl',
        password: 'password123',
      })
      .expect(201);

    await agent.post('/api/auth/logout').expect(200);
    // Second logout should not 500
    const res = await agent.post('/api/auth/logout');
    expect(res.status).toBeLessThan(500);
  });
});
