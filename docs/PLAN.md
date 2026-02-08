# ICHgram Project Plan

**Status: All phases completed. The application is finished.**

## Executive summary

ICHgram is an Instagram-like, full-stack web app built from a provided Figma design. The project delivered a reliable auth model, media handling, and real-time chat while maintaining UX parity with the design. The tech stack choices prioritized maintainability, rapid iteration, and portfolio-grade practices (testing, CI, clear architecture). All planned phases have been completed successfully.

## Project description

- Name: ICHgram
- Type: Instagram-like full-stack web app built from a provided Figma design
- Primary UI requirements: AppShell with left Sidebar + main content, pages (Home feed grid, Explore grid, Profile, Messages), overlays (Search panel, Notifications panel), auth pages (Login, Sign up, Reset password)
- Core features: auth (register/login/logout/refresh/me), posts CRUD + image upload + post modal view + feed/explore grids, likes (optimistic), comments (pagination), profile by username + edit + avatar upload, search overlay (Users + Tags, debounced), hashtags (extract/normalize + search + /tags/:tag page), notifications overlay (like/comment events; follow optional), chat (REST history + Socket.io realtime, optimistic send, virtualization)

## Deliverables

### MVP definition

- Auth flow complete (register/login/logout/refresh/me) with httpOnly refresh cookie
- Core AppShell + required pages/overlays from Figma
- Posts CRUD with image upload + post modal + feed/explore grids
- Likes + comments with pagination
- Profile view/edit + avatar upload
- Search overlay for users + tags, hashtag page with pagination
- Notifications overlay with like/comment events
- Chat with REST history, realtime updates, optimistic send, and message list virtualization

### Portfolio-ready definition

- MVP plus: polished error handling, stable caching/invalidation, basic tests for auth/posts/chat, CI pipeline, documented architecture/security/performance, and consistent UX details (loading/empty/error states)

---

## Roadmap (11 phases)

### Phase 0 — Foundations and documentation

**Goal:** Establish project structure, docs baseline, and tooling expectations.

**Tasks**

- Create documentation set and link from README
  - [x] Draft plan, architecture, security, performance, API overview
  - [x] Add Documentation section in README
- Define environment variables and secrets inventory
  - [x] List required env vars for client/server
  - [x] Note dev/prod differences (cookie flags, CORS origins)
- Confirm repo layout assumptions (/apps/client, /apps/server)
  - [x] Document folder ownership and boundaries
  - [x] Note shared types approach (client-local types only)
- Establish error format contract
  - [x] Define JSON error shape fields
  - [x] Document common error codes
- Create testing strategy outline
  - [x] Identify critical flows to test
  - [x] Decide smoke vs integration coverage

**Definition of Done (DoD)**

- Docs created and referenced from README
- Error format and env var inventory documented
- Test strategy written at high level

**Dependencies:** none

---

### Phase 1 — Backend scaffolding and data foundations

**Goal:** Create backend structure and data models baseline.

**Tasks**

- Initialize server folder structure (/apps/server with routes/controllers/services/models/middlewares)
  - [x] Create folders and barrel exports
  - [x] Add base config files
- Establish MongoDB connection and config wiring
  - [x] Centralize connection logic
  - [x] Add graceful shutdown handling
- Define core data models: User, Post, Comment, Like
  - [x] Schema fields and indexes noted in docs
  - [x] Model ownership rules outlined
- Add validation layer structure (Zod)
  - [x] Define validators per domain
  - [x] Centralize request validation middleware
- Define shared pagination contract
  - [x] Cursor shape, page size defaults
  - [x] Response metadata standard

**DoD**

- Folder layout and model list established
- Validation and pagination approach documented

**Dependencies:** Phase 0

---

### Phase 2 — Auth, session, and security baseline

**Goal:** Implement the authentication model and base security controls.

**Tasks**

- Build auth endpoints (register/login/logout/refresh/me)
  - [x] Request/response schemas
  - [x] Access token TTL + refresh cookie
- Apply strict CORS + cookie config
  - [x] Allow only client origin
  - [x] Enable credentials where needed
- Auth rate limiting
  - [ ] Rate limit register/login/refresh (not implemented — planned as future enhancement)
- Implement auth middleware + guards
  - [x] JWT verification
  - [x] Attach user to request context
- Add password hashing and reset UI endpoints (if needed)
  - [x] bcrypt integration
  - [x] Reset token flow placeholder (UI only)

**DoD**

- Auth flow end-to-end with refresh cookies
- CORS configured
- Auth middleware documented

**Dependencies:** Phase 1

---

### Phase 3 — Media pipeline and post CRUD

**Goal:** Enable image uploads and CRUD operations for posts.

**Tasks**

- Implement upload pipeline (multer + sharp)
  - [x] Size/type whitelist
  - [x] Normalize output sizes/formats
- Create post endpoints (create/read/update/delete)
  - [x] Ownership checks for edit/delete
  - [x] Post modal fetch support
- Build feed and explore endpoints with pagination
  - [x] Cursor-based list
  - [x] Sort by createdAt
- Add post metadata fields for UI
  - [x] author summary, like/comment counts
  - [x] timestamps for sorting
- Document file storage strategy
  - [x] Local dev path or storage abstraction

**DoD**

- Posts CRUD works with image processing
- Feed/explore endpoints paginated

**Dependencies:** Phase 2

---

### Phase 4 — Hashtags and tag discovery

**Goal:** Implement hashtag extraction and tag-based discovery.

**Tasks**

- Extract hashtags from captions on backend
  - [x] Normalize: lowercase, letters/digits/\_
  - [x] De-duplicate, max 10
- Persist hashtags in Post.hashtags[] with index
  - [x] Multikey index on hashtags
  - [x] Verify in schema
- Add tag search endpoint for overlay
  - [x] Search by partial tag
  - [x] Return tag counts
- Add tag page endpoint /tags/:tag with pagination
  - [x] Posts by tag with cursor
  - [x] Include total count
- Update API docs with hashtag rules
  - [x] Validation rules summarized
  - [x] Edge case notes

**DoD**

- Hashtags extracted, indexed, searchable
- Tag page endpoint available

**Dependencies:** Phase 3

---

### Phase 5 — Likes, comments, and notifications core

**Goal:** Deliver interaction mechanics with pagination and notifications hooks.

**Tasks**

- Implement likes endpoints
  - [x] Like/unlike with unique index
  - [x] Idempotent responses
- Build comments endpoints with pagination
  - [x] Create/delete comment
  - [x] Cursor pagination
- Create notifications model and endpoints
  - [x] Like/comment notification records
  - [x] Read/unread support
- Enforce authorization rules
  - [x] Only owners can delete own content
  - [x] Notification access by owner
- Add interaction count updates
  - [x] Increment/decrement counts on post
  - [x] Consistent response shape

**DoD**

- Likes and comments working with pagination
- Notifications for like/comment supported

**Dependencies:** Phase 4

---

### Phase 6 — Search and profile features

**Goal:** Enable user discovery and profile management.

**Tasks**

- User search endpoint for overlay
  - [x] Debounced query support
  - [x] Basic pagination
- Profile view by username
  - [x] Public profile data
  - [x] User posts list with pagination
- Profile edit and avatar upload
  - [x] Update display name/bio
  - [x] Avatar upload via media pipeline
- Follow/following system
  - [x] Follow/unfollow endpoints
  - [x] Unique compound index
- Document search response shapes
  - [x] User + tag responses
  - [x] Empty state guidance

**DoD**

- Search overlay endpoints for users/tags
- Profile view/edit + avatar upload

**Dependencies:** Phase 5

---

### Phase 7 — Chat and realtime socket layer

**Goal:** Deliver chat REST history and real-time messaging via Socket.io.

**Tasks**

- Create conversation and message models
  - [x] Participant list enforced
  - [x] Index on conversationId + createdAt
- Build chat REST endpoints
  - [x] List conversations
  - [x] Cursor pagination for messages
- Implement Socket.io events
  - [x] Send/receive message
  - [x] Delivery ack payload
- Enforce chat authorization
  - [x] Only participants can read/send
  - [x] Validate payloads with Zod
- Document realtime contract
  - [x] Events and payloads
  - [x] Error handling expectations

**DoD**

- Chat REST + Socket.io working
- Authorization and validation enforced

**Dependencies:** Phase 6

---

### Phase 8 — Frontend shell and shared UI

**Goal:** Build the overall UI skeleton and shared components.

**Tasks**

- Implement AppShell layout from Figma
  - [x] Left sidebar + main content
  - [x] Responsive layout rules
- Set up routing map
  - [x] Pages: Home, Explore, Profile, Messages
  - [x] Auth: Login, Sign up, Reset password
- Configure state layers
  - [x] React Query client + defaults
  - [x] Zustand store for overlays/modals
- Build shared UI primitives
  - [x] Buttons, inputs, modal panel, cards
  - [x] Skeleton/loading states
- Add base API client and error handling
  - [x] Standard error shape parsing
  - [x] Toast/inline error patterns

**DoD**

- AppShell and routes render from skeleton
- Shared UI and state layers ready

**Dependencies:** Phase 7

---

### Phase 9 — Feature pages and overlays

**Goal:** Implement page-level UI and wire to APIs.

**Tasks**

- Home feed + post modal
  - [x] Feed grid with pagination
  - [x] Modal post view with comments
- Explore grid + tag page
  - [x] Explore infinite scroll
  - [x] /tags/:tag grid with pagination
- Search overlay and Notifications overlay
  - [x] Debounced search for users/tags
  - [x] Notifications list and read state
- Profile page
  - [x] View by username
  - [x] Edit profile + avatar upload
- Messages page
  - [x] Conversations list
  - [x] Chat view with react-virtuoso

**DoD**

- All required pages/overlays wired to APIs
- Loading/empty/error states present

**Dependencies:** Phase 8

---

### Phase 10 — Quality, performance, and CI

**Goal:** Stabilize performance, add tests, and document CI.

**Tasks**

- Add critical API tests (auth/posts/chat)
  - [x] Supertest suites
  - [x] Seed data strategy
- Add client performance rules
  - [x] Query invalidation for likes/comments/posts/hashtags
  - [x] Avoid duplicate requests
- Document and validate indexes
  - [x] Ensure all required indexes are created
  - [x] Note migration strategy
- Finalize CI pipeline
  - [x] Lint, test, build steps
  - [x] Failure conditions documented
- UX polish and error audits
  - [x] Network error handling
  - [x] Retry patterns for queries

**DoD**

- Tests green for critical flows
- Performance requirements documented and met
- CI pipeline defined

**Dependencies:** Phase 9

---

## Scope cuts (time-savers)

The following items were originally identified as scope-cut candidates. Most were ultimately implemented:

- Follow/following system — **implemented**
- Notification read/unread state — **implemented**
- Recent search history (client-only) — **implemented**
- Auth rate limiting (express-rate-limit) — not implemented
- Password reset backend flow — not implemented (UI placeholder only)
- Typing indicators and read receipts in chat — not implemented
- Trending tags or tag analytics — not implemented

## Suggested PR strategy

- One issue per PR, named `feature/<issue-title>` or `fix/<issue-title>`
- Keep PRs under ~300 lines when possible; split large tasks
- Require a short checklist in each PR description (what/why/test)
- Squash merge preferred; clean, imperative commit messages
