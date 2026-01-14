# API Overview

Base path assumed: `/api`

## Auth
- POST `/auth/register` — Register user (public)
  - Request:
```json
{ "email": "a@b.com", "username": "name", "password": "secret" }
```
  - Response:
```json
{ "user": { "id": "u1", "username": "name" }, "accessToken": "jwt" }
```
- POST `/auth/login` — Login (public)
  - Request:
```json
{ "email": "a@b.com", "password": "secret" }
```
- POST `/auth/logout` — Clear refresh cookie (private)
- POST `/auth/refresh` — Rotate refresh cookie (public)
- GET `/auth/me` — Current user (private)

## Posts
- GET `/posts/feed` — Home feed (private)
- GET `/posts/explore` — Explore grid (private)
- POST `/posts` — Create post with image (private)
- GET `/posts/:id` — Post detail for modal (private)
- PATCH `/posts/:id` — Edit own post (private)
- DELETE `/posts/:id` — Delete own post (private)

Post shape:
```json
{ "id": "p1", "authorId": "u1", "caption": "text", "hashtags": ["tag"], "createdAt": "ISO" }
```

## Comments
- GET `/posts/:id/comments` — List comments (private)
- POST `/posts/:id/comments` — Add comment (private)
- DELETE `/comments/:id` — Delete comment (private)

Comment shape:
```json
{ "id": "c1", "postId": "p1", "authorId": "u1", "text": "hi" }
```

## Likes
- POST `/posts/:id/like` — Like post (private)
- DELETE `/posts/:id/like` — Unlike post (private)

Like response:
```json
{ "postId": "p1", "liked": true, "likeCount": 10 }
```

## Search
- GET `/search/users?q=...` — User search (private)
- GET `/search/tags?q=...` — Tag search (private)

## Tags
- GET `/tags/:tag` — Tag page (private)

Tag response:
```json
{ "tag": "travel", "posts": ["p1"], "nextCursor": "..." }
```

## Notifications
- GET `/notifications` — List notifications (private)
- PATCH `/notifications/:id/read` — Mark read (private, optional)

Notification shape:
```json
{ "id": "n1", "type": "like", "actorId": "u2", "postId": "p1" }
```

## Chat
- GET `/conversations` — List conversations (private)
- GET `/conversations/:id/messages` — Message history (private)
- POST `/conversations/:id/messages` — Send message (private)

Message shape:
```json
{ "id": "m1", "conversationId": "c1", "senderId": "u1", "text": "hey" }
```

## Socket.io events
- `chat:join` — Join a conversation
```json
{ "conversationId": "c1" }
```
- `chat:message` — Send message
```json
{ "conversationId": "c1", "tempId": "t1", "text": "hi" }
```
- `chat:message:ack` — Message acknowledged
```json
{ "tempId": "t1", "messageId": "m1", "createdAt": "ISO" }
```
- `chat:message:new` — New message broadcast
```json
{ "message": { "id": "m1", "conversationId": "c1", "text": "hi" } }
```

