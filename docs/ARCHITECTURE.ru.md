# Архитектура

## Структура репозитория (top-level)
- /apps
- /docs

## Рекомендуемая структура папок

### /apps/client/src
- app/ (routing, layout, providers)
- assets/ (static assets)
- components/ (shared UI components)
- features/ (feature-based UI and hooks)
- hooks/ (shared hooks)
- lib/ (api client, utilities)
- pages/ (route-level pages)
- stores/ (Zustand stores for UI state)
- styles/ (Tailwind base styles)
- types/ (client-side types)

### /apps/server/src
- config/ (env parsing, constants)
- controllers/ (request handlers)
- middlewares/ (auth, validation, error)
- models/ (Mongoose schemas)
- routes/ (express routers)
- services/ (business logic)
- sockets/ (Socket.io setup and events)
- utils/ (helpers)
- validations/ (Zod schemas)

## Архитектура фронтенда

### Карта маршрутов
- Pages: Home, Explore, Profile, Messages
- Auth: Login, Sign up, Reset password
- Overlays: Search panel, Notifications panel
- Modals: Post modal view

### Стратегия состояния
- Server-state: TanStack Query (API caching, pagination, invalidation)
- UI state: Zustand (overlays, modals, small client flags)

### Организация компонентов
- Shared UI: `components/` (buttons, cards, dialogs)
- Feature UI: `features/<domain>/` (page sections, forms)
- Page-level composition: `pages/`

## Архитектура бэкенда

### Слоистая структура
- Routes: define endpoints and attach validators
- Controllers: request/response orchestration
- Services: business logic and data access
- Models: Mongoose schemas and indexes
- Middlewares: auth, validation, error handling

### Организация Socket слоя
- `sockets/index.ts` инициализирует Socket.io
- `sockets/events/` регистрирует chat events и auth guards

## Обзор моделей данных
- User
- Post (включает `hashtags: string[]`)
- Comment
- Like
- Follow (optional)
- Notification
- Conversation
- Message

### Hashtags
- Хранятся в `Post.hashtags[]` (нормализованные lowercase)
- Multikey индекс на `posts.hashtags`

## Контракт обработки ошибок
Стандартный формат ошибки:
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

## Почему не Next.js/Redux
- Vite + React упрощают сборку и ускоряют итерации для портфолио проекта
- Требования не требуют SSR
- TanStack Query + Zustand покрывают server-state и UI state без лишней прослойки
- Redux добавит бойлерплейт без ощутимой пользы
