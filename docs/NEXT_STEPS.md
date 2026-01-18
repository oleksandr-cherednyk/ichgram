# Контекст и продолжение работы

Этот файл описывает текущее состояние проекта и ближайшие шаги, чтобы можно было быстро продолжить работу в новой сессии.

## Что уже сделано (кратко)

Backend:

- Реализованы Фазы 0–2 (auth полностью готов): register/login/logout/refresh/me.
- JWT + refresh cookie, CORS, rate limiting, единый формат ошибок.
- Zod‑валидации, requestId, smoke‑тесты.

Frontend:

- Маршруты `/login`, `/signup`, `/reset`, `/me`.
- Tailwind + базовые shadcn UI компоненты.
- Login/Signup формы подключены к API.
- Zustand store для accessToken и статуса авторизации.
- Редирект на `/me` после успешного login/signup.
- Кнопка logout на `/me`.
- Страницы `/login`, `/signup`, `/reset` стилизованы в одном стиле.
- Vite proxy `/api` → `http://localhost:4000`.

## Важные файлы

- Auth backend:
  - `apps/server/src/services/auth.service.ts`
  - `apps/server/src/controllers/auth.controller.ts`
  - `apps/server/src/routes/auth.routes.ts`
- Auth frontend:
  - `apps/client/src/pages/auth/LoginPage.tsx`
  - `apps/client/src/pages/auth/SignupPage.tsx`
  - `apps/client/src/pages/auth/ResetPage.tsx`
  - `apps/client/src/pages/MePage.tsx`
  - `apps/client/src/lib/api.ts`
  - `apps/client/src/stores/auth.ts`
- Документация:
  - `docs/EXPLANATIONS.md`
  - `docs/AUTH_IMPLEMENTATION_REPORT.md`
  - `docs/plan/TODO.md`

## Что осталось по auth (frontend)

1. Reset форма:

- Подключить RHF + Zod и показать сообщение об успехе (без backend).

2. Ошибки по полям:

- Маппинг `error.details` от backend в ошибки полей.

3. Персистентность auth (опционально):

- Если нужно хранить accessToken между перезагрузками — локальный storage.

## Как запустить

- Backend: `pnpm dev:server`
- Frontend: `pnpm dev:client`

## Примечания по стилю

- Цвет кнопки: `#0095F6` (белый текст).
- Цвет бордера: `#DBDBDB`.
- Цвет текста лейбла: `#737373`.
- Белый фон глобально в `apps/client/src/index.css`.
