# ICHgram — Instagram-like Social App (React + Express + MongoDB)

ICHgram is a full-stack social media application inspired by Instagram, built from a Figma design.
It features authentication, a posts feed, likes/comments, user profiles, follow system, search, hashtags, notifications, and real-time direct messaging.

## Features

### Authentication

- Sign up / Log in / Log out
- JWT access token (1 hour) + httpOnly refresh cookie (7 days)
- Auto-refresh on 401 with race condition protection (`withAuth` wrapper)
- In-flight query cancellation on logout/session expiry
- Protected routes with token expiry check

### Posts

- Home feed page (responsive grid, max 6 latest posts)
- Explore page (3-column grid with tall items spanning 2 rows)
- Create post (image upload + caption with hashtag extraction)
- Edit / Delete own post (3-dot actions menu)
- Post detail modal and standalone post page
- Post caption with truncated preview and "more" button

### Social actions

- Like / Unlike posts (optimistic updates)
- Like / Unlike comments
- Comments with cursor pagination
- Follow / Unfollow users
- Followers / Following lists (paginated)

### Search

- Slide-in Search panel (full-width on mobile)
- User search by username / full name (debounced)
- Tag search by partial match
- Recent search history (client-side)

### Hashtags

- Extracted and normalized from captions on the backend
- Multikey index for fast tag search
- Tag page with posts by hashtag (`/tags/:tag`)
- Tag search endpoint with post counts

### Notifications

- Slide-in Notifications panel (full-width on mobile)
- Events: likes, comments, follows
- Read / unread state with unread badge
- Clear all notifications
- Paginated notification list

### Messages (Real-time)

- Conversations list with unread badges
- Chat history with cursor pagination
- Real-time messaging via Socket.io
- Optimistic send with delivery acknowledgement
- Delete conversation, mark as read
- Virtualized message list (react-virtuoso)
- Emoji picker

### User Profiles

- Public profile view by username
- Own profile (unified with public profile page)
- Edit profile (fullName, bio, website)
- Avatar upload with image optimization
- Posts grid on profile

### Responsive Design

- Desktop sidebar navigation (245px / collapsible to 72px)
- Mobile bottom navigation (Home, Search, Create, Messages, Menu)
- Mobile slide-out menu (Profile, Explore, Notifications, Logout)
- All pages adapted for 375px+ screens
- Post detail modal: full-screen on mobile, centered on desktop

## Documentation

- [docs/PLAN.md](docs/PLAN.md) — Project plan and roadmap
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Architecture and code structure
- [docs/SECURITY.md](docs/SECURITY.md) — Security model and controls
- [docs/PERFORMANCE.md](docs/PERFORMANCE.md) — Performance and caching strategy
- [docs/API_OVERVIEW.md](docs/API_OVERVIEW.md) — API endpoints reference
- [docs/EXPLANATIONS.md](docs/EXPLANATIONS.md) — Code walkthrough (Russian)

---

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI)
- TanStack Query v5 (server-state caching, pagination)
- Zustand (UI/client state)
- React Hook Form + Zod (forms + validation)
- Socket.io client (real-time messaging)
- react-virtuoso (chat virtualization)
- emoji-picker-react
- lucide-react (icons)

### Backend

- Node.js + TypeScript
- Express 5
- MongoDB + Mongoose
- Zod validation
- JWT (access token) + Refresh token (httpOnly cookie)
- bcrypt (password hashing)
- Socket.io (real-time messaging)
- multer + sharp (image upload + optimization)
- helmet, cors

### Dev / Quality

- ESLint + Prettier
- Husky + lint-staged
- Vitest + Supertest (API tests)
- GitHub Actions CI (lint -> test -> build)

---

## Architecture Overview

### Project Structure

```
ichgram/
├── apps/
│   ├── client/          # React frontend (Vite)
│   └── server/          # Express backend (Node.js)
├── docs/                # Documentation
├── package.json         # Root workspace scripts
├── pnpm-workspace.yaml  # Monorepo config
└── eslint.config.cjs    # Global ESLint config
```

### State management

- **Server-state (API data):** TanStack Query — caching, pagination, invalidation, optimistic updates
- **UI state (overlays/modals):** Zustand — auth token, search/notification/create-post/mobile-menu overlays, chat active conversation
- **Cache helpers:** Shared `updatePostInFeedCache`/`updatePostCache` for DRY cache mutations across hooks

### Real-time chat

- **REST API** for message history + cursor pagination
- **Socket.io** for real-time updates (new messages, conversation deletion)
- MongoDB is the source of truth (no message loss on refresh)

### Database models (9)

User, Post, Comment, Like, CommentLike, Follow, Notification, Conversation, Message

---

## Security Decisions

- Refresh token stored in **httpOnly cookie** (prevents JS token theft via XSS)
- Short-lived access token (1 hour)
- Strict CORS policy (`origin = CLIENT_ORIGIN`, `credentials = true`)
- Validation with Zod on all API inputs
- File upload restrictions (size/type whitelist) + sharp processing
- Ownership checks on edit/delete (posts, comments, profile)
- Username validation (regex + reserved names blacklist)
- `passwordHash` excluded from query results by default (`select: false`)

---

## Performance Decisions

- Cursor-based pagination for feed, comments, messages, notifications, tags
- MongoDB indexes on all query-heavy fields:
  - posts (createdAt, authorId+createdAt, hashtags)
  - likes (postId+userId unique)
  - comment-likes (commentId+userId unique)
  - follows (followerId+followingId unique)
  - comments (postId+createdAt)
  - messages (conversationId+createdAt)
  - notifications (userId+createdAt)
  - conversations (participantIds, participantIds+lastMessageAt)
- TanStack Query caching with staleTime and query invalidation
- Optimistic updates for likes and messages
- Virtualized message list for large chats
- `.lean()` on all read-only Mongoose queries
- Lazy-loaded emoji picker (`React.lazy`)
- Cascade deletion on post delete (likes, comments, comment-likes, notifications)

---

## Getting Started

### Requirements

- Node.js >= 20
- pnpm >= 10
- MongoDB (local or Docker)

### Environment variables

Create `apps/server/.env`:

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/ichgram
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
CLIENT_ORIGIN=http://localhost:5173
```

### Install

```bash
pnpm install
```

If native deps were skipped, run:

```bash
pnpm approve-builds
```

### Run

From the repo root:

```bash
pnpm dev          # client + server
pnpm dev:client   # http://localhost:5173
pnpm dev:server   # http://localhost:4000
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Lint

```bash
pnpm lint
```
