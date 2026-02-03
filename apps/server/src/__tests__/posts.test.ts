import path from 'path';
import request from 'supertest';
import { describe, expect, it, beforeEach } from 'vitest';

import { buildTestApp } from './helpers/app';
import { registerAndLogin } from './helpers/auth';
import { setupTestDb } from './helpers/setup';

const app = buildTestApp();

// Create a tiny valid JPEG for upload tests
const TEST_IMAGE_PATH = path.join(__dirname, 'helpers', 'test.jpg');

describe('posts', () => {
  setupTestDb();

  let token: string;
  let userId: string;
  let username: string;

  beforeEach(async () => {
    const auth = await registerAndLogin(app, {
      email: 'poster@test.com',
      username: 'poster',
    });
    token = auth.accessToken;
    userId = auth.user.id;
    username = auth.user.username;
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  const createPost = async (caption = 'hello') => {
    const res = await request(app)
      .post('/api/posts')
      .set(auth())
      .attach('image', TEST_IMAGE_PATH)
      .field('caption', caption)
      .expect(201);
    return res.body;
  };

  describe('CRUD', () => {
    it('creates a post with image', async () => {
      const body = await createPost('my caption');
      expect(body.post).toBeDefined();
      expect(body.post.caption).toBe('my caption');
      expect(body.post.imageUrl).toContain('/uploads/');
    });

    it('gets a single post', async () => {
      const { post } = await createPost();
      const res = await request(app)
        .get(`/api/posts/${post.id}`)
        .set(auth())
        .expect(200);
      expect(res.body.post.id).toBe(post.id);
    });

    it('updates caption', async () => {
      const { post } = await createPost('old');
      const res = await request(app)
        .patch(`/api/posts/${post.id}`)
        .set(auth())
        .send({ caption: 'new caption' })
        .expect(200);
      expect(res.body.post.caption).toBe('new caption');
    });

    it('deletes a post', async () => {
      const { post } = await createPost();
      await request(app)
        .delete(`/api/posts/${post.id}`)
        .set(auth())
        .expect(204);

      const res = await request(app).get(`/api/posts/${post.id}`).set(auth());
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('likes', () => {
    it('like and unlike flow', async () => {
      const { post } = await createPost();

      // Like (201 for new like)
      const likeRes = await request(app)
        .post(`/api/posts/${post.id}/like`)
        .set(auth())
        .expect(201);
      expect(likeRes.body.liked).toBe(true);

      // Unlike
      const unlikeRes = await request(app)
        .delete(`/api/posts/${post.id}/like`)
        .set(auth())
        .expect(200);
      expect(unlikeRes.body.liked).toBe(false);
    });

    it('double like is idempotent', async () => {
      const { post } = await createPost();

      await request(app)
        .post(`/api/posts/${post.id}/like`)
        .set(auth())
        .expect(201);

      // Second like returns 200 (already liked)
      const res = await request(app)
        .post(`/api/posts/${post.id}/like`)
        .set(auth());
      expect(res.status).toBe(200);
    });
  });

  describe('comments', () => {
    it('create and list comments', async () => {
      const { post } = await createPost();

      await request(app)
        .post(`/api/posts/${post.id}/comments`)
        .set(auth())
        .send({ text: 'nice post!' })
        .expect(201);

      const res = await request(app)
        .get(`/api/posts/${post.id}/comments`)
        .set(auth())
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].text).toBe('nice post!');
    });

    it('delete own comment', async () => {
      const { post } = await createPost();

      const commentRes = await request(app)
        .post(`/api/posts/${post.id}/comments`)
        .set(auth())
        .send({ text: 'to delete' })
        .expect(201);

      const commentId = commentRes.body.comment.id;

      await request(app)
        .delete(`/api/posts/${post.id}/comments/${commentId}`)
        .set(auth())
        .expect(204);
    });

    it('cannot delete another user comment', async () => {
      const { post } = await createPost();

      // Create comment as poster
      const commentRes = await request(app)
        .post(`/api/posts/${post.id}/comments`)
        .set(auth())
        .send({ text: 'my comment' })
        .expect(201);

      const commentId = commentRes.body.comment.id;

      // Register another user
      const other = await registerAndLogin(app, {
        email: 'other@test.com',
        username: 'other',
      });

      const res = await request(app)
        .delete(`/api/posts/${post.id}/comments/${commentId}`)
        .set({ Authorization: `Bearer ${other.accessToken}` });

      expect(res.status).toBe(403);
    });
  });

  describe('feed & explore', () => {
    it('feed returns posts from followed users', async () => {
      // Create another user with a post
      const other = await registerAndLogin(app, {
        email: 'author@test.com',
        username: 'author',
      });

      await request(app)
        .post('/api/posts')
        .set({ Authorization: `Bearer ${other.accessToken}` })
        .attach('image', TEST_IMAGE_PATH)
        .field('caption', 'other post')
        .expect(201);

      // Follow the other user (201 for new follow)
      await request(app)
        .post(`/api/users/${other.user.username}/follow`)
        .set(auth())
        .expect(201);

      const feedRes = await request(app)
        .get('/api/posts/feed')
        .set(auth())
        .expect(200);

      expect(feedRes.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('explore returns posts', async () => {
      await createPost('explore me');

      const res = await request(app)
        .get('/api/posts/explore')
        .set(auth())
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
