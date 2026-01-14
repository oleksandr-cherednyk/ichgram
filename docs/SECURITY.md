# Security

## Auth model
- Access token: short-lived JWT returned to client
- Refresh token: httpOnly cookie, rotated on refresh
- Cookie flags
  - Dev: httpOnly, sameSite=lax, secure=false (localhost)
  - Prod: httpOnly, sameSite=none, secure=true

## Threat-driven checklist
- XSS: keep refresh token in httpOnly cookie; avoid injecting HTML
- CSRF: use sameSite and strict CORS, require credentials only for auth
- Brute force: rate limit login/register/refresh, generic error messaging
- Unauthorized access: enforce ownership checks on posts/comments/notifications
- File upload abuse: size/type whitelist, sharp processing, strip metadata

## Security controls by feature
- Auth endpoints: rate limit + validation + consistent error responses
- Posts/comments/likes: require auth; ownership on edit/delete
- Profile edit: only self can update profile/avatar
- Notifications: only owner can fetch or mark read
- Chat: only conversation participants can read/send

## Rate limiting plan
- /auth/register: moderate limit (e.g., 5 per minute per IP)
- /auth/login: stricter limit (e.g., 5 per minute per IP)
- /auth/refresh: moderate limit with burst control
- Global fallback limit for public endpoints

## Validation rules
- Zod validation for body, query, and params
- Reject unknown fields on write endpoints
- Normalize and validate hashtags on the backend

## Authorization matrix
- Posts: create = auth user; edit/delete = post owner
- Comments: create = auth user; delete = comment owner or post owner
- Likes: like/unlike = auth user
- Profile: view public; edit = self
- Notifications: read = owner only
- Messages: read/send = conversation participants only
- Tags: public read only

## Logging and error handling
- Do not log passwords, tokens, or refresh cookies
- Store request IDs for tracing
- Use standard error response shape across API

