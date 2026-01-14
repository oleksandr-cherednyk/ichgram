# ICHgram Project Plan

## Executive summary

ICHgram is an Instagram-like, full-stack web app built from a provided Figma design. The plan emphasizes a reliable auth model, media handling, and real-time chat while keeping UX parity with the design. The tech stack choices prioritize maintainability, rapid iteration, and portfolio-grade practices (testing, CI, clear architecture).

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
  - [ ] Draft plan, architecture, security, performance, API overview
  - [ ] Add Documentation section in README
- Define environment variables and secrets inventory
  - [ ] List required env vars for client/server
  - [ ] Note dev/prod differences (cookie flags, CORS origins)
- Confirm repo layout assumptions (/apps/client, /apps/server)
  - [ ] Document folder ownership and boundaries
  - [ ] Note shared types approach (client-local types only)
- Establish error format contract
  - [ ] Define JSON error shape fields
  - [ ] Document common error codes
- Create testing strategy outline
  - [ ] Identify critical flows to test
  - [ ] Decide smoke vs integration coverage

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
  - [ ] Create folders and barrel exports
  - [ ] Add base config files
- Establish MongoDB connection and config wiring
  - [ ] Centralize connection logic
  - [ ] Add graceful shutdown handling
- Define core data models: User, Post, Comment, Like
  - [ ] Schema fields and indexes noted in docs
  - [ ] Model ownership rules outlined
- Add validation layer structure (Zod)
  - [ ] Define validators per domain
  - [ ] Centralize request validation middleware
- Define shared pagination contract
  - [ ] Cursor shape, page size defaults
  - [ ] Response metadata standard

**DoD**

- Folder layout and model list established
- Validation and pagination approach documented

**Dependencies:** Phase 0

---

### Phase 2 — Auth, session, and security baseline

**Goal:** Implement the authentication model and base security controls.

**Tasks**

- Build auth endpoints (register/login/logout/refresh/me)
  - [ ] Request/response schemas
  - [ ] Access token TTL + refresh cookie
- Apply strict CORS + cookie config
  - [ ] Allow only client origin
  - [ ] Enable credentials where needed
- Add auth rate limiting
  - [ ] Rate limit register/login/refresh
  - [ ] Document thresholds
- Implement auth middleware + guards
  - [ ] JWT verification
  - [ ] Attach user to request context
- Add password hashing and reset UI endpoints (if needed)
  - [ ] bcrypt integration
  - [ ] Reset token flow placeholder (UI only)

**DoD**

- Auth flow end-to-end with refresh cookies
- Rate limiting + CORS configured
- Auth middleware documented

**Dependencies:** Phase 1

---

### Phase 3 — Media pipeline and post CRUD

**Goal:** Enable image uploads and CRUD operations for posts.

**Tasks**

- Implement upload pipeline (multer + sharp)
  - [ ] Size/type whitelist
  - [ ] Normalize output sizes/formats
- Create post endpoints (create/read/update/delete)
  - [ ] Ownership checks for edit/delete
  - [ ] Post modal fetch support
- Build feed and explore endpoints with pagination
  - [ ] Cursor-based list
  - [ ] Sort by createdAt
- Add post metadata fields for UI
  - [ ] author summary, like/comment counts
  - [ ] timestamps for sorting
- Document file storage strategy
  - [ ] Local dev path or storage abstraction

**DoD**

- Posts CRUD works with image processing
- Feed/explore endpoints paginated

**Dependencies:** Phase 2

---

### Phase 4 — Hashtags and tag discovery

**Goal:** Implement hashtag extraction and tag-based discovery.

**Tasks**

- Extract hashtags from captions on backend
  - [ ] Normalize: lowercase, letters/digits/\_
  - [ ] De-duplicate, max 10
- Persist hashtags in Post.hashtags[] with index
  - [ ] Multikey index on hashtags
  - [ ] Verify in schema
- Add tag search endpoint for overlay
  - [ ] Search by partial tag
  - [ ] Return tag counts
- Add tag page endpoint /tags/:tag with pagination
  - [ ] Posts by tag with cursor
  - [ ] Include total count
- Update API docs with hashtag rules
  - [ ] Validation rules summarized
  - [ ] Edge case notes

**DoD**

- Hashtags extracted, indexed, searchable
- Tag page endpoint available

**Dependencies:** Phase 3

---

### Phase 5 — Likes, comments, and notifications core

**Goal:** Deliver interaction mechanics with pagination and notifications hooks.

**Tasks**

- Implement likes endpoints
  - [ ] Like/unlike with unique index
  - [ ] Idempotent responses
- Build comments endpoints with pagination
  - [ ] Create/delete comment
  - [ ] Cursor pagination
- Create notifications model and endpoints
  - [ ] Like/comment notification records
  - [ ] Read/unread support (optional)
- Enforce authorization rules
  - [ ] Only owners can delete own content
  - [ ] Notification access by owner
- Add interaction count updates
  - [ ] Increment/decrement counts on post
  - [ ] Consistent response shape

**DoD**

- Likes and comments working with pagination
- Notifications for like/comment supported

**Dependencies:** Phase 4

---

### Phase 6 — Search and profile features

**Goal:** Enable user discovery and profile management.

**Tasks**

- User search endpoint for overlay
  - [ ] Debounced query support
  - [ ] Basic pagination
- Profile view by username
  - [ ] Public profile data
  - [ ] User posts list with pagination
- Profile edit and avatar upload
  - [ ] Update display name/bio
  - [ ] Avatar upload via media pipeline
- Add optional follow model (scope-cut eligible)
  - [ ] Follow/unfollow endpoints
  - [ ] Unique compound index
- Document search response shapes
  - [ ] User + tag responses
  - [ ] Empty state guidance

**DoD**

- Search overlay endpoints for users/tags
- Profile view/edit + avatar upload

**Dependencies:** Phase 5

---

### Phase 7 — Chat and realtime socket layer

**Goal:** Deliver chat REST history and real-time messaging via Socket.io.

**Tasks**

- Create conversation and message models
  - [ ] Participant list enforced
  - [ ] Index on conversationId + createdAt
- Build chat REST endpoints
  - [ ] List conversations
  - [ ] Cursor pagination for messages
- Implement Socket.io events
  - [ ] Send/receive message
  - [ ] Delivery ack payload
- Enforce chat authorization
  - [ ] Only participants can read/send
  - [ ] Validate payloads with Zod
- Document realtime contract
  - [ ] Events and payloads
  - [ ] Error handling expectations

**DoD**

- Chat REST + Socket.io working
- Authorization and validation enforced

**Dependencies:** Phase 6

---

### Phase 8 — Frontend shell and shared UI

**Goal:** Build the overall UI skeleton and shared components.

**Tasks**

- Implement AppShell layout from Figma
  - [ ] Left sidebar + main content
  - [ ] Responsive layout rules
- Set up routing map
  - [ ] Pages: Home, Explore, Profile, Messages
  - [ ] Auth: Login, Sign up, Reset password
- Configure state layers
  - [ ] React Query client + defaults
  - [ ] Zustand store for overlays/modals
- Build shared UI primitives
  - [ ] Buttons, inputs, modal panel, cards
  - [ ] Skeleton/loading states
- Add base API client and error handling
  - [ ] Standard error shape parsing
  - [ ] Toast/inline error patterns

**DoD**

- AppShell and routes render from skeleton
- Shared UI and state layers ready

**Dependencies:** Phase 7

---

### Phase 9 — Feature pages and overlays

**Goal:** Implement page-level UI and wire to APIs.

**Tasks**

- Home feed + post modal
  - [ ] Feed grid with pagination
  - [ ] Modal post view with comments
- Explore grid + tag page
  - [ ] Explore infinite scroll
  - [ ] /tags/:tag grid with pagination
- Search overlay and Notifications overlay
  - [ ] Debounced search for users/tags
  - [ ] Notifications list and read state
- Profile page
  - [ ] View by username
  - [ ] Edit profile + avatar upload
- Messages page
  - [ ] Conversations list
  - [ ] Chat view with react-virtuoso

**DoD**

- All required pages/overlays wired to APIs
- Loading/empty/error states present

**Dependencies:** Phase 8

---

### Phase 10 — Quality, performance, and CI

**Goal:** Stabilize performance, add tests, and document CI.

**Tasks**

- Add critical API tests (auth/posts/chat)
  - [ ] Supertest suites
  - [ ] Seed data strategy
- Add client performance rules
  - [ ] Query invalidation for likes/comments/posts/hashtags
  - [ ] Avoid duplicate requests
- Document and validate indexes
  - [ ] Ensure all required indexes are created
  - [ ] Note migration strategy
- Finalize CI pipeline
  - [ ] Lint, test, build steps
  - [ ] Failure conditions documented
- UX polish and error audits
  - [ ] Network error handling
  - [ ] Retry patterns for queries

**DoD**

- Tests green for critical flows
- Performance requirements documented and met
- CI pipeline defined

**Dependencies:** Phase 9

---

## Scope cuts (time-savers)

- Follow/following system (optional)
- Typing indicators and read receipts in chat
- Trending tags or tag analytics
- Notification read/unread state
- Recent search history (client-only)

## Suggested PR strategy

- One issue per PR, named `feature/<issue-title>` or `fix/<issue-title>`
- Keep PRs under ~300 lines when possible; split large tasks
- Require a short checklist in each PR description (what/why/test)
- Squash merge preferred; clean, imperative commit messages
