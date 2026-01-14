# Производительность

## Стратегия пагинации
- Предпочтительно cursor pagination для feed, comments, messages и tag page
- Cursor поля: createdAt + _id для стабильной сортировки
- Метаданные ответа: nextCursor, hasMore

## Обязательные MongoDB индексы
- posts: { createdAt }
- posts: { authorId, createdAt }
- likes: unique compound { postId, userId }
- follows (optional): unique compound { followerId, followingId }
- messages: { conversationId, createdAt }
- hashtags: multikey index on posts.hashtags

## Стратегия обработки изображений
- Разрешать только whitelisted типы (jpg/png/webp)
- Ограничить размер и размеры изображений
- Использовать sharp для оптимизированных выходных форматов (max width/height)

## Правила клиентского кэширования
- Query keys по доменам (auth, posts, comments, likes, tags, chat)
- Инвалидировать post detail и feed lists после create/edit/delete
- Инвалидировать лайки после like/unlike с optimistic update
- Инвалидировать комментарии после create/delete
- Инвалидировать tag результаты при изменении hashtags
- Избегать дублей запросов через staleTime и dedupe

## Виртуализация чата
- Использовать react-virtuoso для списка сообщений
- Cursor pagination для предотвращения больших payload

## Performance acceptance criteria
- Feed/Explore загружаются < 2с на fast 4G
- Pagination запросы < 500мс median на локальной БД
- Чат плавный для 1,000+ сообщений
- Upload изображений дает оптимизированные файлы нужного размера

