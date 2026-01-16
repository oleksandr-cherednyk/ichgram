# Фаза 2 — детальный план реализации (Auth, сессии и безопасность)

## Цели фазы

- Реализовать полный auth flow (register/login/logout/refresh/me).
- Зафиксировать безопасную модель с access token + refresh cookie.
- Настроить CORS/cookies и rate limiting согласно решениям.

## Итоговые артефакты

- Рабочие auth endpoints с валидацией.
- Middleware авторизации.
- Конфигурации CORS/cookies/ratelimit.
- Базовые тесты auth (минимум smoke).

## Шаги реализации

### 1. Базовый Express app и инфраструктура

- Создать Express app и подключить:
  - `helmet`, `cors`, `cookie-parser`, `express.json()`.
- Включить CORS глобально:
  - `origin = CLIENT_ORIGIN`.
  - `credentials = true`.
- Завести единый `error handler` под контракт ошибки:
  - `{ error: { code, message, details?, requestId? } }`.
- Добавить базовый `requestId` middleware (по желанию) для трассировки.

### 2. Конфигурация cookies и окружения

- Закрепить dev/prod cookie flags:
  - dev: `httpOnly=true`, `sameSite=lax`, `secure=false`.
  - prod: `httpOnly=true`, `sameSite=none`, `secure=true`.
- Убедиться, что `NODE_ENV` влияет на выбор флагов.
- Refresh cookie устанавливается на `/auth/refresh` и очищается на `/auth/logout`.

### 3. JWT и auth утилиты

- Реализовать утилиты:
  - `signAccessToken(userId)`.
  - `signRefreshToken(userId)`.
  - `verifyAccessToken`.
  - `verifyRefreshToken`.
- TTL брать из env:
  - `ACCESS_TOKEN_TTL` (default 15m).
  - `REFRESH_TOKEN_TTL` (default 7d).

### 4. Модель пользователя и хранение пароля

- Для регистрации и логина использовать `bcrypt`:
  - `hash(password)` при регистрации.
  - `compare(password, hash)` при логине.
- Проверять уникальность email/username.

### 5. Валидации (Zod)

- Создать схемы:
  - register (email, username, password).
  - login (email, password).
  - refresh (без body).
- Централизованный middleware валидации:
  - body/query/params.

### 6. Auth endpoints

- `POST /auth/register`
  - Валидация данных.
  - Создать пользователя.
  - Вернуть `{ user, accessToken }`.
  - Установить refresh cookie.
- `POST /auth/login`
  - Валидация.
  - Проверить пароль.
  - Вернуть `{ user, accessToken }`.
  - Установить refresh cookie.
- `POST /auth/logout`
  - Очистить refresh cookie.
  - Вернуть `{ ok: true }`.
- `POST /auth/refresh`
  - Проверить refresh cookie.
  - Переиздать access token + refresh cookie.
  - Вернуть `{ accessToken }`.
- `GET /auth/me`
  - Проверка access token.
  - Вернуть профиль пользователя.

### 7. Auth middleware

- `requireAuth`:
  - Проверяет access token в `Authorization: Bearer`.
  - Подкладывает `req.user`.
  - Ошибки по контракту.

### 8. Rate limiting

- Ограничения для:
  - `/auth/register`, `/auth/login`, `/auth/refresh`.
- Единый формат ошибки `RATE_LIMITED`.

### 9. Тесты (минимум)

- Smoke тест:
  - register -> login -> me -> logout.
- Проверка refresh:
  - refresh выдаёт новый access token.

## Риски и заметки

- Всегда включать `credentials` на клиенте для запросов с cookies.
- CORS должен быть глобальным, иначе refresh cookie не будет работать в браузере.
- В проде `sameSite=none` требует `secure=true`.
