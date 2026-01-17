# TODO по фазам

## Фаза 0 — Фундаменты и документация (закрыта)

- [x] Создать каркас папок `/apps/client` и `/apps/server` и базовую структуру `src/` согласно `docs/ARCHITECTURE.md`
- [x] Инициализировать `package.json` в `apps/client` и `apps/server`
- [x] Установить зависимости по стеку (frontend и backend отдельно)
- [x] Добавить базовые конфиги для TypeScript, ESLint, Prettier (минимальные, без правил)
- [x] Создать `.env.example` для клиента и сервера
- [x] Настроены pnpm workspaces и корневые скрипты запуска
- [x] Добавлены Husky + lint-staged и CI workflow (lint → test → build)
- [x] Созданы .editorconfig и обновлен README под pnpm
- [x] Сформирован pnpm-lock.yaml
- [x] Выполнено approve-builds для нативных зависимостей (bcrypt/esbuild/sharp)
- [x] Добавлены пустые entrypoints для клиента и сервера
- [x] Добавлен минимальный ESLint flat-config для pre-commit

## Фаза 1 — Backend scaffolding и модели

Статус: закрыта

- [x] Реализован кодовый каркас (папки, конфиги, модели, пагинация, ошибки)

- [x] Зафиксировать структуру слоев /apps/server/src (routes/controllers/services/models/middlewares)
- [x] Определить модели данных и индексы (User/Post/Comment/Like/Notification/Conversation/Message/Follow)
  - User, Post, Comment, Like, Notification, Conversation, Message, Follow (согласовано)
- [x] Согласовать контракт пагинации (cursor + metadata)
  - Cursor: opaque (createdAt + \_id), sort createdAt desc + \_id desc
  - Response: data, nextCursor, hasMore; limit default 20, max 50
- [x] Согласовать стандарт ошибок API (единый JSON‑формат)
  - Формат: { error: { code, message, details?, requestId? } }
- [x] Определить env vars сервера и поведение dev/prod (CORS, cookie flags, JWT TTL)
  - Env: PORT, MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_ORIGIN, ACCESS_TOKEN_TTL=15m, REFRESH_TOKEN_TTL=7d, NODE_ENV
  - Cookies: dev httpOnly/lax/secure=false; prod httpOnly/none/secure=true
  - CORS: origin=CLIENT_ORIGIN, credentials=true (глобально)

## Фаза 2 — Auth, сессии и безопасность

- [ ] Детальный план в docs/plan/PHASE_2_DETAIL.md
- [x] Базовый Express app с CORS/cookies middleware
- [x] HTTP сервер + health route
- [x] Zod-валидации auth + middleware validate
- [x] JWT утилиты
- [x] Auth middleware requireAuth
- [x] Auth сервис, контроллеры и роуты
- [x] Refresh cookie helper (dev/prod flags)
- [x] Rate limiting для /auth/\*
- [x] Smoke-тесты auth (register/login/me/refresh/logout)

## Решения

- Структура проекта: /apps/client и /apps/server
- Управление зависимостями: pnpm workspace
- Общие команды из корня: dev, lint, test, build
- .npmrc не требуется на текущем этапе
