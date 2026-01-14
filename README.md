# ICHgram — Instagram-like Social App (React + Express + MongoDB)

ICHgram is a full-stack social media app inspired by Instagram.
It includes authentication, posts feed, likes/comments, user profiles, search, notifications and real-time chat.

## Demo

- Live demo: _(add link)_
- Figma screens: _(add link or screenshots folder)_

## Screenshots

> Add screenshots here (feed, profile, post modal, create post, messages, notifications panel, search panel)

## Features

### Authentication

- Sign up / Log in / Log out
- Refresh session (access + refresh tokens)
- Password reset UI (optional)

### Posts

- Feed page (grid layout inspired by Instagram)
- Explore page (media grid)
- Create post (image upload + caption)
- Edit/Delete own post
- Post modal view

### Social actions

- Like / Unlike (optimistic updates)
- Comments (pagination)
- Follow / Unfollow (optional)

### Search

- Slide-in Search panel
- User search by username/full name
- Recent search history (client-side)

### Notifications

- Slide-in Notifications panel
- Events: likes, comments, follows
- Read / unread state (optional)

### Messages (Real-time)

- Conversations list
- Chat history (pagination)
- Real-time messaging via Socket.io
- Optimistic send + delivery acknowledgement

## Documentation

- docs/PLAN.md
- docs/ARCHITECTURE.md
- docs/SECURITY.md
- docs/PERFORMANCE.md
- docs/API_OVERVIEW.md

---

## Tech Stack

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI)
- TanStack Query (server-state caching)
- Zustand (UI/client state)
- React Hook Form + Zod (forms + validation)
- Socket.io client
- react-virtuoso (chat virtualization)
- dayjs (date/time formatting)

### Backend

- Node.js + TypeScript
- Express
- MongoDB + Mongoose
- Zod validation
- JWT (access token) + Refresh token (httpOnly cookie)
- bcrypt
- Socket.io
- multer + sharp (image upload + optimization)
- helmet, cors, express-rate-limit

### Dev / Quality

- ESLint + Prettier
- Husky + lint-staged
- Vitest
- Supertest (API tests)
- GitHub Actions CI (lint → test → build)

---

## Architecture Overview

### Project Structure

apps/
client/ # React client
server/ # Express server

### State management

- **Server-state (API data):** TanStack Query
- **UI state (overlays/modals):** Zustand
- This keeps the app predictable and avoids storing API caches in Redux manually.

### Real-time chat

- **REST API** for initial message history + pagination
- **Socket.io** for real-time updates (new messages, typing, etc.)
- MongoDB is the source of truth (no message loss on refresh)

---

## Security Decisions

- Refresh token stored in **httpOnly cookie** (prevents JS token theft via XSS)
- Short-lived access token
- Strict CORS policy
- Rate limiting on auth endpoints
- Validation with Zod on API inputs
- File upload restrictions (size/type) + sharp processing

---

## Performance Decisions

- Pagination/cursor-based loading for feed, comments and messages
- MongoDB indexes on:
  - posts (createdAt, authorId)
  - likes (postId+userId unique)
  - follows (followerId+followingId unique)
  - messages (conversationId+createdAt)
- React Query caching and invalidation strategy
- Virtualized message list for large chats

---

## Getting Started

### Requirements

- Node.js >= 20
- pnpm >= 10
- MongoDB (local or Docker)

### Environment variables

Create env files based on templates:

**apps/server/.env**
PORT=4000
MONGO_URI=mongodb://localhost:27017/ichgram
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_ORIGIN=localhost:5000

**apps/client/.env**
VITE_API_URL=http://localhost:4000

### Install

pnpm install

### Run

From the repo root:

- `pnpm dev` (client + server)
- `pnpm dev:client`
- `pnpm dev:server`

If native deps were skipped, run:
`pnpm approve-builds`
