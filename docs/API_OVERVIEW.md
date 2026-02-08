# API Overview

Base path assumed: `/api`

## Auth

- POST `/auth/register` -- Register user (public)
  - Request:

```json
{
  "email": "a@b.com",
  "username": "name",
  "fullName": "Full Name",
  "password": "secret"
}
```

- Response:

```json
{
  "user": {
    "id": "u1",
    "email": "a@b.com",
    "username": "name",
    "fullName": "Full Name",
    "avatarUrl": null
  },
  "accessToken": "jwt"
}
```

- POST `/auth/login` -- Login (public)
  - Request:

```json
{ "email": "a@b.com", "password": "secret" }
```

- POST `/auth/logout` -- Clear refresh cookie (private)
- POST `/auth/refresh` -- Rotate tokens (public)
- GET `/auth/me` -- Current user (private)

## Posts

- GET `/posts/feed` -- Home feed (private)
- GET `/posts/explore` -- Explore grid (private)
- GET `/posts/top` -- Top 10 posts by likes (private)
- GET `/posts/:id` -- Post detail (private)
- POST `/posts` -- Create post with image (private)
- PATCH `/posts/:id` -- Edit own post (private)
- DELETE `/posts/:id` -- Delete own post (private)

Post shape:

```json
{
  "id": "p1",
  "authorId": "u1",
  "caption": "text",
  "hashtags": ["tag"],
  "createdAt": "ISO"
}
```

## Likes

- POST `/posts/:id/like` -- Like post (private)
- DELETE `/posts/:id/like` -- Unlike post (private)

Like response:

```json
{ "postId": "p1", "liked": true, "likeCount": 10 }
```

## Comments

- GET `/posts/:id/comments` -- List comments, cursor paginated (private)
- POST `/posts/:id/comments` -- Add comment (private)
- DELETE `/posts/:id/comments/:commentId` -- Delete comment, author only (private)
- POST `/posts/:id/comments/:commentId/like` -- Like comment (private)
- DELETE `/posts/:id/comments/:commentId/like` -- Unlike comment (private)

Comment shape:

```json
{ "id": "c1", "postId": "p1", "authorId": "u1", "text": "hi" }
```

## Users

- GET `/users/me` -- Current user profile (private)
- PATCH `/users/me` -- Update profile: fullName, bio, website (private)
- POST `/users/me/avatar` -- Upload avatar (private)
- GET `/users/search?q=...` -- Search users (optional auth)
- GET `/users/:username` -- User profile (optional auth)
- GET `/users/:username/posts` -- User posts, paginated (optional auth)

## Follow

- POST `/users/:username/follow` -- Follow user (private)
- DELETE `/users/:username/follow` -- Unfollow user (private)
- GET `/users/:username/followers` -- Followers list (optional auth)
- GET `/users/:username/following` -- Following list (optional auth)

## Chat (all private)

- POST `/conversations` -- Find or create conversation
- GET `/conversations` -- List conversations
- GET `/conversations/unread-count` -- Unread message count
- DELETE `/conversations/:id` -- Delete conversation
- GET `/conversations/:id/messages` -- Message history, paginated
- POST `/conversations/:id/messages` -- Send message
- PATCH `/conversations/:id/read` -- Mark as read

Message shape:

```json
{ "id": "m1", "conversationId": "c1", "senderId": "u1", "text": "hey" }
```

## Notifications (all private)

- GET `/notifications` -- List notifications, paginated
- GET `/notifications/unread-count` -- Unread count
- DELETE `/notifications` -- Clear all
- PATCH `/notifications/:id/read` -- Mark as read

Notification shape:

```json
{ "id": "n1", "type": "like", "actorId": "u2", "postId": "p1" }
```

## Tags

- GET `/tags/search?q=...` -- Search tags (public)
- GET `/tags/:tag/posts` -- Posts by hashtag, paginated (public)

Tag response:

```json
{ "tag": "travel", "posts": ["p1"], "nextCursor": "..." }
```

## Socket.io events

Connection: JWT token via `auth.token` handshake parameter. User joins room `user:{userId}`.

### Client -> Server

- `message:send` -- Send message

```json
{ "conversationId": "c1", "text": "hi" }
```

### Server -> Client

- `message:new` -- New message broadcast

```json
{
  "message": {
    "id": "m1",
    "conversationId": "c1",
    "senderId": "u1",
    "sender": { "id": "u1", "username": "name", "avatarUrl": "/img.jpg" },
    "text": "hi",
    "createdAt": "ISO"
  }
}
```

- `conversation:deleted` -- Conversation deleted

```json
{ "conversationId": "c1" }
```
