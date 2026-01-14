# Performance

## Pagination strategy
- Prefer cursor pagination for feed, comments, messages, and tag page
- Cursor fields: createdAt + _id for stable ordering
- Standard response metadata: nextCursor, hasMore

## Required MongoDB indexes
- posts: { createdAt }
- posts: { authorId, createdAt }
- likes: unique compound { postId, userId }
- follows (optional): unique compound { followerId, followingId }
- messages: { conversationId, createdAt }
- hashtags: multikey index on posts.hashtags

## Image processing strategy
- Accept only whitelisted image types (jpg/png/webp)
- Enforce max upload size and dimensions
- Use sharp to generate optimized outputs (e.g., max width/height variants)

## Client caching rules
- Query keys by domain (auth, posts, comments, likes, tags, chat)
- Invalidate post detail and feed lists after create/edit/delete
- Invalidate likes counts on like/unlike with optimistic updates
- Invalidate comments list on create/delete
- Invalidate tag results on post create/edit when hashtags change
- Avoid duplicate fetches via staleTime and query dedupe

## Chat virtualization
- Use react-virtuoso for message list
- Maintain cursor pagination to prevent large payloads

## Performance acceptance criteria
- Feed and explore load initial grid under 2s on fast 4G
- Pagination requests under 500ms median on local dev DB
- Chat message list remains smooth for 1,000+ messages
- Image uploads produce optimized files under target size

