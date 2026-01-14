# Architecture

## Repo structure (top-level)
- /apps
- /docs

## Recommended folder layout

### /apps/client/src
- app/ (routing, layout, providers)
- assets/ (static assets)
- components/ (shared UI components)
- features/ (feature-based UI and hooks)
- hooks/ (shared hooks)
- lib/ (api client, utilities)
- pages/ (route-level pages)
- stores/ (Zustand stores for UI state)
- styles/ (Tailwind base styles)
- types/ (client-side types)

### /apps/server/src
- config/ (env parsing, constants)
- controllers/ (request handlers)
- middlewares/ (auth, validation, error)
- models/ (Mongoose schemas)
- routes/ (express routers)
- services/ (business logic)
- sockets/ (Socket.io setup and events)
- utils/ (helpers)
- validations/ (Zod schemas)

## Frontend architecture

### Routing map
- Pages: Home, Explore, Profile, Messages
- Auth: Login, Sign up, Reset password
- Overlays: Search panel, Notifications panel
- Modals: Post modal view

### State strategy
- Server-state: TanStack Query (API caching, pagination, invalidation)
- UI state: Zustand (overlays, modals, small client flags)

### Component organization
- Shared UI: `components/` (buttons, cards, dialogs)
- Feature UI: `features/<domain>/` (page sections, forms)
- Page-level composition: `pages/`

## Backend architecture

### Layered structure
- Routes: define endpoints and attach validators
- Controllers: request/response orchestration
- Services: business logic and data access
- Models: Mongoose schemas and indexes
- Middlewares: auth, validation, error handling

### Socket layer organization
- `sockets/index.ts` bootstraps Socket.io
- `sockets/events/` registers chat events and auth guards

## Data model overview
- User
- Post (includes `hashtags: string[]`)
- Comment
- Like
- Follow (optional)
- Notification
- Conversation
- Message

### Hashtags
- Stored in `Post.hashtags[]` (normalized lowercase)
- Multikey index on `posts.hashtags`

## Error handling contract
Standard error response shape:
```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message",
    "details": { "field": "optional" },
    "requestId": "optional-id"
  }
}
```

## Why not Next.js/Redux
- Vite + React keeps the client build fast and simple for a portfolio project
- API-driven architecture does not require SSR for the stated requirements
- TanStack Query + Zustand already cover server-state and UI state cleanly
- Redux would add boilerplate without additional value here
