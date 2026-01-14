# Обзор API

Базовый префикс: `/api`

## Auth
- POST `/auth/register` — Регистрация (public)
  - Request:
```json
{ "email": "a@b.com", "username": "name", "password": "secret" }
```
  - Response:
```json
{ "user": { "id": "u1", "username": "name" }, "accessToken": "jwt" }
```
- POST `/auth/login` — Логин (public)
  - Request:
```json
{ "email": "a@b.com", "password": "secret" }
```
- POST `/auth/logout` — Очистка refresh cookie (private)
- POST `/auth/refresh` — Ротация refresh cookie (public)
- GET `/auth/me` — Текущий пользователь (private)

## Posts
- GET `/posts/feed` — Лента (private)
- GET `/posts/explore` — Explore grid (private)
- POST `/posts` — Создать пост с изображением (private)
- GET `/posts/:id` — Детали поста для модалки (private)
- PATCH `/posts/:id` — Редактировать пост (private)
- DELETE `/posts/:id` — Удалить пост (private)

Post shape:
```json
{ "id": "p1", "authorId": "u1", "caption": "text", "hashtags": ["tag"], "createdAt": "ISO" }
```

## Comments
- GET `/posts/:id/comments` — Список комментариев (private)
- POST `/posts/:id/comments` — Добавить комментарий (private)
- DELETE `/comments/:id` — Удалить комментарий (private)

Comment shape:
```json
{ "id": "c1", "postId": "p1", "authorId": "u1", "text": "hi" }
```

## Likes
- POST `/posts/:id/like` — Лайк (private)
- DELETE `/posts/:id/like` — Снять лайк (private)

Like response:
```json
{ "postId": "p1", "liked": true, "likeCount": 10 }
```

## Search
- GET `/search/users?q=...` — Поиск пользователей (private)
- GET `/search/tags?q=...` — Поиск тегов (private)

## Tags
- GET `/tags/:tag` — Страница тега (private)

Tag response:
```json
{ "tag": "travel", "posts": ["p1"], "nextCursor": "..." }
```

## Notifications
- GET `/notifications` — Список уведомлений (private)
- PATCH `/notifications/:id/read` — Пометить как прочитанное (private, optional)

Notification shape:
```json
{ "id": "n1", "type": "like", "actorId": "u2", "postId": "p1" }
```

## Chat
- GET `/conversations` — Список диалогов (private)
- GET `/conversations/:id/messages` — История сообщений (private)
- POST `/conversations/:id/messages` — Отправить сообщение (private)

Message shape:
```json
{ "id": "m1", "conversationId": "c1", "senderId": "u1", "text": "hey" }
```

## Socket.io events
- `chat:join` — Вход в диалог
```json
{ "conversationId": "c1" }
```
- `chat:message` — Отправка сообщения
```json
{ "conversationId": "c1", "tempId": "t1", "text": "hi" }
```
- `chat:message:ack` — Подтверждение доставки
```json
{ "tempId": "t1", "messageId": "m1", "createdAt": "ISO" }
```
- `chat:message:new` — Новое сообщение
```json
{ "message": { "id": "m1", "conversationId": "c1", "text": "hi" } }
```

