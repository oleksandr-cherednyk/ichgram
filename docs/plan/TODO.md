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

## Фаза 1 — Backend scaffolding и модели (не начата)

- [ ] Структура слоев /apps/server/src (routes/controllers/services/models/middlewares)
- [ ] Базовый конфиг подключения MongoDB (без реализации логики)
- [ ] Черновые схемы данных и индексы в документации

## Решения

- Структура проекта: /apps/client и /apps/server
- Управление зависимостями: pnpm workspace
- Общие команды из корня: dev, lint, test, build
- .npmrc не требуется на текущем этапе
