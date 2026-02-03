import request from 'supertest';
import { describe, expect, it, beforeEach } from 'vitest';

import { buildTestApp } from './helpers/app';
import { registerAndLogin } from './helpers/auth';
import { setupTestDb } from './helpers/setup';

const app = buildTestApp();

describe('chat', () => {
  setupTestDb();

  let tokenA: string;
  let tokenB: string;
  let userBId: string;

  beforeEach(async () => {
    const a = await registerAndLogin(app, {
      email: 'alice@test.com',
      username: 'alice',
    });
    const b = await registerAndLogin(app, {
      email: 'bob@test.com',
      username: 'bob',
    });
    tokenA = a.accessToken;
    tokenB = b.accessToken;
    userBId = b.user.id;
  });

  const authA = () => ({ Authorization: `Bearer ${tokenA}` });
  const authB = () => ({ Authorization: `Bearer ${tokenB}` });

  it('creates a conversation and lists it', async () => {
    const createRes = await request(app)
      .post('/api/conversations')
      .set(authA())
      .send({ participantId: userBId })
      .expect(201);

    expect(createRes.body.conversation).toBeDefined();
    const convId =
      createRes.body.conversation.id ?? createRes.body.conversation._id;

    const listRes = await request(app)
      .get('/api/conversations')
      .set(authA())
      .expect(200);

    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('sends and lists messages', async () => {
    const createRes = await request(app)
      .post('/api/conversations')
      .set(authA())
      .send({ participantId: userBId })
      .expect(201);

    const convId =
      createRes.body.conversation.id ?? createRes.body.conversation._id;

    await request(app)
      .post(`/api/conversations/${convId}/messages`)
      .set(authA())
      .send({ text: 'hello bob' })
      .expect(201);

    await request(app)
      .post(`/api/conversations/${convId}/messages`)
      .set(authB())
      .send({ text: 'hi alice' })
      .expect(201);

    const msgRes = await request(app)
      .get(`/api/conversations/${convId}/messages`)
      .set(authA())
      .expect(200);

    expect(msgRes.body.data.length).toBe(2);
  });

  it('non-participant cannot access messages', async () => {
    const createRes = await request(app)
      .post('/api/conversations')
      .set(authA())
      .send({ participantId: userBId })
      .expect(201);

    const convId =
      createRes.body.conversation.id ?? createRes.body.conversation._id;

    // Register a third user
    const c = await registerAndLogin(app, {
      email: 'charlie@test.com',
      username: 'charlie',
    });

    const res = await request(app)
      .get(`/api/conversations/${convId}/messages`)
      .set({ Authorization: `Bearer ${c.accessToken}` });

    expect(res.status).toBe(403);
  });
});
