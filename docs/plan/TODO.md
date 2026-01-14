# Сегодняшние задачи

- [x] Создать каркас папок `/apps/client` и `/apps/server` и базовую структуру `src/` согласно `docs/ARCHITECTURE.md`
- [x] Инициализировать `package.json` в `apps/client` и `apps/server`
- [x] Установить зависимости по стеку (frontend и backend отдельно)
- [x] Добавить базовые конфиги для TypeScript, ESLint, Prettier (минимальные, без правил)
- [x] Создать `.env.example` для клиента и сервера

## Учет проделанной работы

- [x] Настроены pnpm workspaces и корневые скрипты запуска
- [x] Добавлены Husky + lint-staged и CI workflow (lint → test → build)
- [x] Созданы .editorconfig и обновлен README под pnpm
- [x] Сформирован pnpm-lock.yaml
- [x] Выполнено approve-builds для нативных зависимостей (bcrypt/esbuild/sharp)

## Решения

- Структура проекта: /apps/client и /apps/server
- Управление зависимостями: pnpm workspace
- Общие команды из корня: dev, lint, test, build
- .npmrc не требуется на текущем этапе
