# План проекта ICHgram

## Executive summary

ICHgram — Instagram-подобное полнофункциональное веб‑приложение, построенное по предоставленному дизайну Figma. План делает акцент на надежной модели аутентификации, обработке медиа и real‑time чату при сохранении соответствия UX дизайну. Выбор стека нацелен на поддерживаемость, быструю итерацию и портфолио‑уровень практик (тестирование, CI, понятная архитектура).

## Описание проекта

- Название: ICHgram
- Тип: Instagram‑подобное полнофункциональное веб‑приложение, созданное по Figma
- Основные требования UI: AppShell с левым сайдбаром и основной областью, страницы (Home с сеткой фида, Explore с медиасеткой, Profile, Messages), оверлеи (Search panel, Notifications panel), страницы аутентификации (Login, Sign up, Reset password)
- Ключевые функции: auth (register/login/logout/refresh/me), посты CRUD + загрузка изображений + модальное окно поста + сетки фида/эксплора, лайки (optimistic), комментарии (пагинация), профиль по username + редактирование + загрузка аватара, поиск в оверлее (Users + Tags, с дебаунсом), хэштеги (извлечение/нормализация + поиск + страница /tags/:tag), уведомления (like/comment; follow — опционально), чат (REST‑история + Socket.io realtime, optimistic send, виртуализация)

## Технические решения

- Репозиторий: `/apps/client` (React + Vite + TS), `/apps/server` (Express + TS + MongoDB/Mongoose), `/docs` (архитектура/контракты/решения)
- Управление состоянием: server‑state через TanStack Query, UI/client‑state для оверлеев/модалок через Zustand; Redux не используется
- Контракты API: единый формат ошибок, единая пагинация (opaque cursor), строгие правила CORS/cookies

## Deliverables

### Определение MVP

- Полный auth flow (register/login/logout/refresh/me) с httpOnly refresh cookie
- AppShell + обязательные страницы/оверлеи из Figma
- CRUD постов с загрузкой изображения + модалка поста + сетки фида/эксплора
- Лайки + комментарии с пагинацией
- Профиль: просмотр/редактирование + загрузка аватара
- Search overlay для пользователей и тегов, страница тега с пагинацией
- Notifications overlay с событиями like/comment
- Чат с REST‑историей, realtime, optimistic send и виртуализацией списка

### Определение portfolio‑ready

- MVP плюс: качественная обработка ошибок, стабильное кэширование/инвалидация, базовые тесты для auth/постов/чата, CI, документация архитектуры/безопасности/перфоманса, и согласованная UX‑детализация (loading/empty/error состояния)

---

## Roadmap (11 фаз)

### Фаза 0 — Фундаменты и документация

**Цель:** Зафиксировать структуру проекта, базу документации и ожидания по инструментам.

**Tasks**

- Создать набор документации и добавить ссылку в README
  - [ ] Составить план, архитектуру, безопасность, производительность, API overview
  - [ ] Добавить раздел Documentation в README
- Подтвердить структуру репозитория
  - [ ] Использовать `/apps/client`, `/apps/server`, `/docs` в документации и ссылках
  - [ ] Описать границы ответственности папок
  - [ ] Отметить подход к типам (локально в клиенте)
- Описать root‑скрипты оркестрации
  - [ ] В корневом `package.json` есть команды: dev, dev:client, dev:server, lint, format, format:check, test, build
  - [ ] Скрипты делегируют выполнение в `/apps/client` и `/apps/server`
- Определить переменные окружения и список секретов
  - [ ] Перечень env vars для сервера: PORT, MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_ORIGIN, ACCESS_TOKEN_TTL (default 15m), REFRESH_TOKEN_TTL (default 7d), NODE_ENV
  - [ ] Зафиксировать dev/prod различия для cookies и CORS
  - [ ] Отметить, что запросы клиента, требующие cookies, отправляются с `credentials` включенными
- Зафиксировать контракт формата ошибок
  - [ ] Единый JSON‑формат ошибки:
    - { error: { code, message, details?, requestId? } }
  - [ ] Базовые коды: VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, INTERNAL_ERROR
- Описать стратегию тестирования
  - [ ] Выделить критические пользовательские потоки
  - [ ] Определить уровень покрытий

**Definition of Done (DoD)**

- Документация создана и связана с README
- Контракты ошибок и env vars описаны
- Root‑скрипты оркестрации зафиксированы
- Стратегия тестов сформулирована

**Dependencies:** нет

---

### Фаза 1 — Каркас backend и базы данных

**Цель:** Создать структуру сервера и базовые модели данных.

**Tasks**

- Инициализировать структуру `/apps/server` (routes/controllers/services/models/middlewares)
  - [ ] Создать папки и экспортные индексы
  - [ ] Добавить базовые конфиги
- Настроить подключение MongoDB и конфиг
  - [ ] Централизовать соединение
  - [ ] Добавить graceful shutdown
- Определить базовые модели: User, Post, Comment, Like, Notification, Conversation, Message, Follow
  - [ ] Поля и индексы отмечены в docs
  - [ ] Правила владения объектами
- Подготовить слой валидаций (Zod)
  - [ ] Валидаторы по доменам
  - [ ] Единый middleware валидации
- Определить контракт пагинации (opaque cursor)
  - [ ] Клиент не парсит курсор, только пересылает
  - [ ] Запрос: `?cursor=<opaque>&limit=20`
  - [ ] Ответ: `{ data: [], nextCursor: "...", hasMore: true }`
  - [ ] Сортировка: createdAt desc, затем \_id desc
  - [ ] hasMore определяется через `limit + 1`

**DoD**

- Структура папок и список моделей определены
- Подход к валидации и пагинации описан

**Dependencies:** Фаза 0

---

### Фаза 2 — Auth, сессии и безопасность

**Цель:** Реализовать модель аутентификации и базовые контроли безопасности.

**Tasks**

- Реализовать auth endpoints (register/login/logout/refresh/me)
  - [ ] Схемы request/response
  - [ ] TTL access token + refresh cookie
- Настроить строгий CORS + cookies
  - [ ] Cookie flags: dev httpOnly=true, sameSite=lax, secure=false
  - [ ] Cookie flags: prod httpOnly=true, sameSite=none, secure=true
  - [ ] CORS: origin=CLIENT_ORIGIN, credentials=true (глобально для API)
  - [ ] Клиентские запросы с cookies отправляются с `credentials`
- Добавить rate limit для auth
  - [ ] Ограничить register/login/refresh
  - [ ] Задокументировать пороги
- Реализовать auth middleware + guards
  - [ ] Проверка JWT
  - [ ] Прикрепление пользователя к request
- Добавить хеширование паролей и UI reset (если нужно)
  - [ ] Интеграция bcrypt
  - [ ] Заглушка для reset flow (UI)

**DoD**

- Auth flow полностью работает с refresh cookies
- Rate limiting и CORS настроены
- Auth middleware задокументирован

**Dependencies:** Фаза 1

---

### Фаза 3 — Медиа‑пайплайн и CRUD постов

**Цель:** Обеспечить загрузку изображений и CRUD операций для постов.

**Tasks**

- Реализовать загрузку медиа (multer + sharp)
  - [ ] Ограничения размера/типа
  - [ ] Нормализация выходных форматов/размеров
- Создать endpoints для постов (create/read/update/delete)
  - [ ] Проверка владения для edit/delete
  - [ ] Поддержка получения поста для модалки
- Реализовать feed/explore endpoints с пагинацией по стандарту opaque cursor
  - [ ] Cursor‑based списки по контракту
  - [ ] Сортировка по createdAt desc + \_id desc
- Добавить метаданные поста для UI
  - [ ] Краткие данные автора, счетчики
  - [ ] Временные метки
- Документировать стратегию хранения файлов
  - [ ] Путь для dev или абстракция стораджа

**DoD**

- CRUD постов работает с обработкой изображений
- Feed/Explore endpoints соответствуют контракту пагинации

**Dependencies:** Фаза 2

---

### Фаза 4 — Хэштеги и discovery по тегам

**Цель:** Реализовать извлечение хэштегов и поиск по тегам.

**Tasks**

- Извлечение хэштегов из caption на backend
  - [ ] Нормализация: lowercase, letters/digits/\_
  - [ ] Удаление дублей, максимум 10
- Хранение в Post.hashtags[] с индексом
  - [ ] Multikey индекс на hashtags
  - [ ] Подтверждение в схеме
- Endpoint поиска тегов для overlay (opaque cursor)
  - [ ] Поиск по частичному совпадению
  - [ ] Возврат счетчиков
- Endpoint страницы тега /tags/:tag с пагинацией (opaque cursor)
  - [ ] Посты по тегу с курсором
  - [ ] Возвращать total count
- Обновить API docs правилами хэштегов
  - [ ] Описать валидацию
  - [ ] Примечания по edge cases

**DoD**

- Хэштеги извлекаются, индексируются и ищутся
- Страница тега доступна

**Dependencies:** Фаза 3

---

### Фаза 5 — Лайки, комментарии, уведомления

**Цель:** Реализовать взаимодействия и базовые уведомления.

**Tasks**

- Реализовать endpoints лайков
  - [ ] Like/unlike с уникальным индексом
  - [ ] Idempotent ответы
- Реализовать endpoints комментариев с пагинацией (opaque cursor)
  - [ ] Создание/удаление комментария
  - [ ] Cursor pagination по стандарту
- Создать модель и endpoints уведомлений
  - [ ] Уведомления о лайках/комментариях
  - [ ] Read/unread (опционально)
  - [ ] Лента уведомлений с opaque cursor
- Соблюсти правила авторизации
  - [ ] Только владелец может удалять свой контент
  - [ ] Уведомления доступны владельцу
- Обновить счетчики взаимодействий
  - [ ] Инкремент/декремент в посте
  - [ ] Единый формат ответа

**DoD**

- Лайки и комментарии работают с пагинацией
- Уведомления для like/comment поддержаны

**Dependencies:** Фаза 4

---

### Фаза 6 — Поиск и профили

**Цель:** Реализовать поиск пользователей и профильные функции.

**Tasks**

- Endpoint поиска пользователей для overlay (opaque cursor)
  - [ ] Поддержка дебаунса
  - [ ] Пагинация по контракту
- Просмотр профиля по username
  - [ ] Публичные данные профиля
  - [ ] Список постов с пагинацией (opaque cursor)
- Редактирование профиля и загрузка аватара
  - [ ] Обновление имени/био
  - [ ] Загрузка аватара через медиа‑пайплайн
- Опциональная модель follow (scope‑cut)
  - [ ] Follow/unfollow endpoints
  - [ ] Уникальный составной индекс
- Документировать ответы поиска
  - [ ] User + Tag ответы
  - [ ] Рекомендации по empty state

**DoD**

- Search overlay endpoints для users/tags
- Профиль: просмотр/редактирование + аватар

**Dependencies:** Фаза 5

---

### Фаза 7 — Чат и realtime слой

**Цель:** Реализовать REST‑историю чата и realtime через Socket.io.

**Tasks**

- Создать модели Conversation и Message
  - [ ] Список участников
  - [ ] Индекс conversationId + createdAt
- Реализовать REST endpoints чата
  - [ ] Список диалогов с opaque cursor
  - [ ] Cursor pagination сообщений по стандарту
- Реализовать Socket.io события
  - [ ] Send/receive message
  - [ ] Payload для delivery ack
  - [ ] Room‑стратегия: join по conversationId и/или userId с проверкой авторизации
- Соблюсти авторизацию чата
  - [ ] Только участники читают/пишут
  - [ ] Валидация payload через Zod
- Документировать realtime контракт
  - [ ] События и payload
  - [ ] Ожидаемая обработка ошибок

**DoD**

- Чат REST + Socket.io работают
- Авторизация и валидация обеспечены

**Dependencies:** Фаза 6

---

### Фаза 8 — Frontend shell и shared UI

**Цель:** Собрать базовый UI‑каркас и общие компоненты.

**Tasks**

- Реализовать AppShell по Figma
  - [ ] Левый sidebar + main content
  - [ ] Правила адаптива
- Настроить роутинг
  - [ ] Pages: Home, Explore, Profile, Messages
  - [ ] Auth: Login, Sign up, Reset password
- Настроить слои состояния
  - [ ] React Query client + defaults для server‑state
  - [ ] Zustand store для оверлеев/модалок (Redux не используем)
- Создать shared UI примитивы
  - [ ] Buttons, inputs, modal panel, cards
  - [ ] Skeleton/loading состояния
- Добавить базовый API клиент и обработку ошибок
  - [ ] Парсинг стандартного error shape
  - [ ] Маппинг кодов ошибок на UI состояния

**DoD**

- AppShell и роуты отображаются
- Shared UI и state layers готовы

**Dependencies:** Фаза 7

---

### Фаза 9 — Страницы и оверлеи

**Цель:** Реализовать UI страниц и подключить к API.

**Tasks**

- Home feed + post modal
  - [ ] Сетка фида с пагинацией (opaque cursor)
  - [ ] Модалка поста с комментариями
- Explore grid + tag page
  - [ ] Explore infinite scroll по контракту
  - [ ] /tags/:tag grid с пагинацией
- Search overlay и Notifications overlay
  - [ ] Debounced search users/tags
  - [ ] Список уведомлений и read state
- Profile page
  - [ ] Просмотр по username
  - [ ] Редактирование профиля + аватар
- Messages page
  - [ ] Список диалогов с opaque cursor
  - [ ] Чат с react-virtuoso

**DoD**

- Все требуемые страницы/оверлеи подключены к API
- Loading/empty/error состояния присутствуют

**Dependencies:** Фаза 8

---

### Фаза 10 — Quality, performance, CI

**Цель:** Закрепить производительность, тесты и CI.

**Tasks**

- Добавить критические API тесты (auth/posts/chat)
  - [ ] Supertest suites
  - [ ] Стратегия сидов
- Добавить правила client performance
  - [ ] Инвалидация для likes/comments/posts/hashtags
  - [ ] Избегать дублей запросов
- Документировать и проверить индексы
  - [ ] Все обязательные индексы есть
  - [ ] Стратегия миграций
- Финализировать CI pipeline
  - [ ] Lint, test, build steps
  - [ ] Условия провала
- UX‑полировка и аудит ошибок
  - [ ] Сетевые ошибки
  - [ ] Retry паттерны

**DoD**

- Критические тесты проходят
- Performance требования соблюдены и документированы
- CI pipeline описан

**Dependencies:** Фаза 9

---

## Scope cuts (если не хватает времени)

- Follow/following система (опционально)
- Typing indicators и read receipts в чате
- Trending tags или аналитика тегов
- Read/unread состояния уведомлений
- Recent search history (клиент‑only)

## Suggested PR strategy

- Один issue = один PR, имена `feature/<issue-title>` или `fix/<issue-title>`
- Держать PR до ~300 строк, крупные задачи делить
- В описании PR короткий чеклист (what/why/test)
- Предпочтительно squash merge; чистые, императивные commit сообщения
