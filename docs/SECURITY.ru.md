# Безопасность

## Модель аутентификации
- Access token: короткоживущий JWT
- Refresh token: httpOnly cookie, ротация при refresh
- Cookie flags
  - Dev: httpOnly, sameSite=lax, secure=false (localhost)
  - Prod: httpOnly, sameSite=none, secure=true

## Threat-driven checklist
- XSS: хранить refresh token в httpOnly cookie; избегать HTML‑инъекций
- CSRF: sameSite + строгий CORS, credentials только где требуется
- Brute force: rate limit login/register/refresh, унифицированные ошибки
- Unauthorized access: проверка ownership для постов/комментариев/уведомлений
- File upload abuse: whitelist размеров/типов, sharp обработка, удаление метаданных

## Контроли безопасности по функционалу
- Auth endpoints: rate limit + validation + единый формат ошибок
- Posts/comments/likes: require auth; ownership для edit/delete
- Profile edit: только владелец
- Notifications: доступ только владельцу
- Chat: доступ только участникам диалога

## План rate limiting
- /auth/register: умеренный лимит (например, 5/мин на IP)
- /auth/login: строгий лимит (например, 5/мин на IP)
- /auth/refresh: умеренный лимит с burst‑контролем
- Глобальный лимит для публичных endpoints

## Валидация
- Zod validation для body, query и params
- Отклонять неизвестные поля на write endpoints
- Нормализовать и валидировать хэштеги на backend

## Матрица авторизаций
- Posts: create = auth user; edit/delete = post owner
- Comments: create = auth user; delete = comment owner или post owner
- Likes: like/unlike = auth user
- Profile: view public; edit = self
- Notifications: read = owner only
- Messages: read/send = только участники
- Tags: public read only

## Логирование и ошибки
- Не логировать пароли, токены или refresh cookies
- Использовать request IDs для трассировки
- Единый формат ошибок по API

