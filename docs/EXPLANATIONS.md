# Как устроен код ICHgram (объяснения поэтапно)

Документ описывает текущую структуру проекта, архитектурные решения, назначение ключевых файлов и причины выбранных подходов.

Статус: все фазы завершены, приложение полностью реализовано.

## 1) Структура репозитория

- `/apps/client` — React + Vite + TypeScript (клиент).
- `/apps/server` — Express + TypeScript + MongoDB/Mongoose (сервер).
- `/docs` — документация: архитектура, API, безопасность, производительность, план.

Зачем так:

- Четкое разделение фронта и бэка.
- Упрощает сборку, CI и навигацию по коду.

## 2) Как запускается сервер

Файл: `apps/server/src/index.ts`

Что происходит:

1. Подключается MongoDB через `connectToDatabase()`.
2. Регистрируется graceful shutdown (`SIGINT`/`SIGTERM`).
3. Создается Express-приложение `createApp()`.
4. Добавляется `/health` (проверка жизнеспособности).
5. Подключаются все роуты: `/api/auth`, `/api/posts`, `/api/users`, `/api/conversations`, `/api/notifications`, `/api/tags`.
6. Подключается `errorHandler` в самом конце.
7. Создается HTTP-сервер и Socket.io.
8. Запускается сервер.

Почему так:

- БД должна подключаться до обработки запросов.
- error handler должен быть последним, чтобы ловить все ошибки.

## 3) Конфигурация окружения

Файл: `apps/server/src/config/env.ts`

Что делает:

- Читает `.env` через `dotenv/config`.
- Валидирует переменные окружения через Zod.

Обязательные переменные:

- `PORT`
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_ORIGIN`
- `ACCESS_TOKEN_TTL` (default 1h)
- `REFRESH_TOKEN_TTL` (default 7d)
- `COOKIE_SECURE` (default false) — `true` для HTTPS, `false` для HTTP
- `NODE_ENV`

Почему так:

- Ошибки конфигурации видны сразу при старте.

## 4) Express app и middleware

Файл: `apps/server/src/app.ts`

Подключено:

- `helmet` — базовая безопасность заголовков.
- `express.json()` — парсинг JSON.
- `cookie-parser` — доступ к cookies.
- `cors` — CORS с `origin=CLIENT_ORIGIN` и `credentials=true`.
- `requestIdMiddleware` — добавляет `x-request-id` и `req.requestId`.
- `express.static('/uploads')` — статическая раздача загруженных файлов.

Почему так:

- CORS глобальный, иначе refresh cookie не будет работать в браузере.
- requestId упрощает трассировку ошибок.

## 5) Единый формат ошибок

Файлы:

- `apps/server/src/utils/errors.ts`
- `apps/server/src/middlewares/error-handler.ts`

Формат ответа:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message",
    "details": { "field": "optional" },
    "requestId": "optional-id"
  }
}
```

Как работает:

- Любая Zod-ошибка превращается в `VALIDATION_ERROR`.
- Если ошибка содержит `status`, она возвращается как API-ошибка.
- Иначе — `INTERNAL_ERROR`.

## 6) Валидация входящих данных

Файлы:

- `apps/server/src/middlewares/validate.ts`
- `apps/server/src/validations/*.ts`

Как работает:

- `validate({ body/query/params })` парсит вход через Zod.
- При ошибке бросается `ZodError`, а `errorHandler` возвращает `VALIDATION_ERROR`.

## 7) JWT-утилиты

Файл: `apps/server/src/utils/jwt.ts`

Функции:

- `signAccessToken(userId)` — генерация access token
- `signRefreshToken(userId)` — генерация refresh token
- `verifyAccessToken(token)` — проверка access token
- `verifyRefreshToken(token)` — проверка refresh token

## 8) Refresh cookie

Файл: `apps/server/src/utils/cookies.ts`

Правила:

- `COOKIE_SECURE=false`: `httpOnly=true`, `sameSite=lax`, `secure=false`.
- `COOKIE_SECURE=true`: `httpOnly=true`, `sameSite=none`, `secure=true` (требует HTTPS).

Функции:

- `setRefreshCookie(res, token)`
- `clearRefreshCookie(res)`
- `getRefreshTokenFromCookies(cookies)`

## 9) Auth middleware

Файл: `apps/server/src/middlewares/require-auth.ts`

- `requireAuth` — проверяет `Authorization: Bearer <token>`, валидирует access token, сохраняет `userId` в `req.userId`.
- `optionalAuth` — не падает при отсутствии токена, используется для публичных эндпоинтов с опциональной персонализацией.

## 10) Бизнес-логика (services)

Файлы: `apps/server/src/services/*.ts`

- `auth.service.ts` — registerUser, loginUser, refreshSession
- `post.service.ts` — createPost, getPost, updatePost, deletePost, getFeed, getExplorePosts
- `like.service.ts` — likePost, unlikePost
- `comment.service.ts` — createComment, deleteComment, getComments, likeComment, unlikeComment
- `follow.service.ts` — followUser, unfollowUser, getFollowers, getFollowing (внутренний хелпер getFollowList)
- `user.service.ts` — findByEmail, findByUsername, updateProfile, searchUsers
- `chat.service.ts` — findOrCreateConversation, getConversations, sendMessage, broadcastNewMessage
- `tag.service.ts` — searchTags, getPostsByTag
- `notification.service.ts` — createNotification, getNotifications, markAsRead

## 11) Модели данных (9 моделей)

Файлы: `apps/server/src/models/*.model.ts`

- **User** — email, username, fullName, passwordHash, avatarUrl, bio, website
- **Post** — authorId, caption, imageUrl, hashtags[], likeCount, commentCount
- **Comment** — postId, authorId, text, likeCount
- **Like** — postId, userId (unique compound)
- **CommentLike** — commentId, userId (unique compound)
- **Follow** — followerId, followingId (unique compound)
- **Notification** — userId, actorId, type (like/comment/follow), postId, commentId, readAt
- **Conversation** — participantIds[], unreadCounts[], hiddenFor[], clearedAt[], lastMessageAt
- **Message** — conversationId, senderId, text

Индексы:

- Post: `createdAt`, `authorId + createdAt`, `hashtags`
- Like: уникальный `postId + userId`
- CommentLike: уникальный `commentId + userId`
- Follow: уникальный `followerId + followingId`
- Comment: `postId + createdAt`
- Message: `conversationId + createdAt`
- Notification: `userId + createdAt`
- Conversation: `participantIds`, `participantIds + lastMessageAt`

## 12) Пагинация

Файл: `apps/server/src/utils/pagination.ts`

Контракт:

- Запрос: `?cursor=<opaque>&limit=20`
- Ответ: `{ data: [], nextCursor: "...", hasMore: true }`
- Сортировка: `createdAt desc`, затем `_id desc`
- `hasMore` рассчитывается через `limit + 1`.
- Клиент не парсит курсор, только пересылает.

## 13) Socket.io (real-time)

Файл: `apps/server/src/sockets/index.ts`

- Аутентификация через JWT в `auth.token` при handshake
- Пользователь присоединяется к комнате `user:{userId}`
- Событие `message:send` (клиент -> сервер): отправка сообщения
- Событие `message:new` (сервер -> клиент): новое сообщение
- Событие `conversation:deleted` (сервер -> клиент): удаление диалога
- Валидация payload через Zod

## 14) Фронтенд: маршрутизация

Файл: `apps/client/src/app/App.tsx`

Маршруты:

- `/login`, `/signup`, `/reset` — страницы авторизации (публичные)
- `/` — FeedPage (лента постов)
- `/explore` — ExplorePage (сетка постов)
- `/post/:id` — PostPage (детали поста)
- `/profile/:username` — ProfilePage (профиль пользователя)
- `/me` — ProfilePage (собственный профиль, без параметра username)
- `/me/edit` — EditProfilePage (редактирование профиля)
- `/messages` — MessagesPage (чат)
- `/tags/:tag` — TagPage (посты по тегу)
- `*` — NotFoundPage (404)

Оверлеи (доступны на любой странице):

- Search panel (поиск пользователей и тегов)
- Notifications panel (уведомления)
- Create post modal (создание поста)
- Mobile menu drawer (мобильное меню)

## 15) Фронтенд: управление состоянием

Zustand stores (`apps/client/src/stores/`):

- `auth.ts` — accessToken, isAuthenticated
- `chat.ts` — activeConversationId
- `createPost.ts` — isOpen
- `search.ts` — isOpen
- `notification.ts` — isOpen
- `mobileMenu.ts` — isOpen

Дополнительные утилиты:

- `lib/cache-updates.ts` — хелперы `updatePostInFeedCache`, `updatePostCache` для DRY-обновления кэша постов

TanStack Query — кэширование всех API-данных:

- Посты, комментарии, лайки, профили, подписки, диалоги, сообщения, уведомления, теги
- Optimistic updates для лайков и сообщений
- Cursor pagination через `useInfiniteQuery`

## 16) Фронтенд: API клиент

Файл: `apps/client/src/lib/api.ts`

- `withAuth(executeFn, opts)` — общая обёртка: pre-flight refresh, запрос, 401 retry, response parsing
- `apiRequest(url, options)` — fetch-обёртка (использует withAuth)
- `apiUpload(url, method, formData)` — загрузка файлов (использует withAuth)
- Защита от race condition при обновлении токена
- Автоматическая подстановка `Authorization: Bearer <token>`
- При ошибке авторизации: `cancelQueries()` → `clear()` для предотвращения гонки с in-flight запросами

## 17) Фронтенд: адаптивный дизайн

- Desktop (1280px+): боковой Sidebar с навигацией
- Mobile (<768px): нижняя панель навигации (Home, Search, Create, Messages, Menu)
- Mobile menu: выдвижная панель с Profile, Explore, Notifications, Logout
- Все страницы адаптированы для 375px+
- Post detail modal: полноэкранный на мобильном, центрированный на десктопе
