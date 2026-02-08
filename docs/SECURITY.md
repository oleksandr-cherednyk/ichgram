# Security

## Auth model

- Access token: short-lived JWT returned to client
- Refresh token: httpOnly cookie, rotated on refresh
- Cookie flags
  - Dev: httpOnly, sameSite=lax, secure=false (localhost)
  - Prod: httpOnly, sameSite=none, secure=true
- Env vars: PORT, MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_ORIGIN, ACCESS_TOKEN_TTL (default 1h), REFRESH_TOKEN_TTL (default 7d), NODE_ENV

## Threat-driven checklist

- XSS: keep refresh token in httpOnly cookie; avoid injecting HTML
- CSRF: use sameSite and strict CORS, require credentials only for auth
- Brute force: generic error messaging (rate limiting planned as future enhancement)
- Unauthorized access: enforce ownership checks on posts/comments/notifications
- File upload abuse: size/type whitelist, sharp processing, strip metadata
- Session cleanup: `cancelQueries()` before `clear()` on logout/auth failure to prevent in-flight request races
- Cascade deletion: post delete removes associated likes, comments, comment-likes, notifications

## Security controls by feature

- Auth endpoints: validation + consistent error responses
- Posts/comments/likes: require auth; ownership on edit/delete
- Profile edit: only self can update profile/avatar
- Notifications: only owner can fetch or mark read
- Chat: only conversation participants can read/send

## Rate limiting (not yet implemented)

Planned for future enhancement:

- /auth/register: moderate limit (e.g., 5 per minute per IP)
- /auth/login: stricter limit (e.g., 5 per minute per IP)
- /auth/refresh: moderate limit with burst control
- Global fallback limit for public endpoints

## Validation rules

- Zod validation for body, query, and params
- Reject unknown fields on write endpoints
- Normalize and validate hashtags on the backend
- Username validation: regex pattern + reserved names blacklist
- `passwordHash` field excluded from queries by default (`select: false`)
- Regex inputs escaped via `escapeRegex` utility to prevent ReDoS

## Authorization matrix

- Posts: create = auth user; edit/delete = post owner
- Comments: create = auth user; delete = comment author
- Likes: like/unlike = auth user
- CommentLikes: like/unlike comment = auth user
- Follow: follow/unfollow = auth user
- Profile: view public; edit = self
- Notifications: read = owner only
- Messages: read/send = conversation participants only; delete = participant only
- Tags: public read only

## Logging and error handling

- Do not log passwords, tokens, or refresh cookies
- Store request IDs for tracing
- Use standard error response shape across API

## CORS and cookies

- origin = CLIENT_ORIGIN, credentials = true (global)
- Refresh/logout require credentials for httpOnly cookies
