# Architecture

## Repo structure (top-level)

- /apps/client -- Vite + React SPA
- /apps/server -- Express + Mongoose REST API with Socket.io
- /docs -- Architecture documentation

## Folder layout

### /apps/client/src

```
/apps/client/src
├── app/               # App.tsx (routing, providers)
├── assets/            # Static assets (icons, images)
├── components/
│   ├── auth/          # ProtectedRoute
│   ├── chat/          # ChatView, ChatHeader, ChatInput, ConversationList, MessageBubble
│   ├── common/        # ErrorBoundary, LoadingScreen, LoadMoreButton, PostGridItem
│   ├── feed/          # FeedCard, PostContent, PostDetailModal, CreatePostModal, EditPostModal,
│   │                  #   PostActionsModal, CommentsSection, CommentInput, LikeButton, PostFormSidebar, PostCardSkeleton
│   ├── layout/        # Sidebar, MobileNav, MobileMenu, Footer
│   ├── notifications/ # NotificationOverlay, NotificationItem
│   ├── profile/       # ProfileHeader, ProfileGrid, PostViewModal, FollowListModal, AvatarUpload, ProfileSkeleton
│   ├── search/        # SearchOverlay, SearchResults
│   └── ui/            # shadcn/ui primitives (Button, Input, Dialog, Card, Avatar, Skeleton,
│                      #   AlertDialog, Form, Label, ScrollArea, Separator, Spinner, Textarea, Tooltip, etc.)
├── hooks/             # React Query hooks (useProfile, useFeedPosts, useComments, useMessages,
│                      #   useFollow, useTogglePostLike, useToggleCommentLike, useSearchUsers,
│                      #   useSearchTags, useSocketMessages, useSocketNotifications, useLogout,
│                      #   useMarkConversationRead, etc.)
├── layouts/           # AppShell.tsx, AuthLayout.tsx
├── lib/               # api.ts, socket.ts, jwt.ts, navigation.tsx, utils.ts, form-errors.ts, cache-updates.ts, query-client.ts
├── pages/             # FeedPage, ExplorePage, PostPage, ProfilePage, EditProfilePage,
│                      #   MessagesPage, TagPage, NotFoundPage
│   └── auth/          # LoginPage, SignupPage, ResetPage
├── stores/            # Zustand stores: auth, chat, createPost, search, notification, mobileMenu
├── styles/            # (reserved for Tailwind overrides; base styles live in src/index.css)
└── types/             # api, auth, post, user, chat, notification, search
```

There is no `features/` folder in active use. Feature components live in `components/<domain>/`.

### /apps/server/src

```
/apps/server/src
├── config/        # env.ts, db.ts (env parsing, DB connection)
├── controllers/   # auth, user, post, comment, like, follow, tag, chat, notification
├── middlewares/    # require-auth, optional-auth, validate, upload, error-handler, request-id
├── models/        # Mongoose schemas (9 models -- see Data models below)
├── routes/        # auth, user, post, tag, chat, notification
├── services/      # auth, user, post, comment, like, follow, tag, chat, notification
├── sockets/       # index.ts -- Socket.io bootstrap, auth middleware, chat events
├── types/         # express.d.ts (request augmentation)
├── utils/         # jwt, cookies, errors, files, hashtags, pagination, escape-regex
└── validations/   # Zod schemas: auth, user, post, tag, chat, notification, interaction, pagination
```

## Frontend architecture

### Routing map

Auth routes (no sidebar, wrapped by AuthLayout):

- `/login` -- LoginPage
- `/signup` -- SignupPage
- `/reset` -- ResetPage

Protected routes (sidebar via AppShell, guarded by ProtectedRoute):

- `/` -- FeedPage
- `/explore` -- ExplorePage
- `/post/:id` -- PostPage
- `/profile/:username` -- ProfilePage
- `/me` -- ProfilePage (own profile, no username param)
- `/me/edit` -- EditProfilePage
- `/messages` -- MessagesPage
- `/tags/:tag` -- TagPage
- `*` -- NotFoundPage

Modal overlays (available on any protected page via AppShell):

- Search panel (SearchOverlay)
- Notifications panel (NotificationOverlay)
- Create post modal (CreatePostModal)
- Mobile menu drawer (MobileMenu)

### State strategy

Server state -- TanStack Query:

- API caching, pagination, infinite queries
- Mutation + automatic cache invalidation
- All data-fetching hooks live in `hooks/` (one hook per query/mutation)

UI state -- Zustand stores (`stores/`):

- `auth` -- accessToken, isAuthenticated
- `chat` -- activeConversationId
- `createPost` -- isOpen
- `search` -- isOpen
- `notification` -- isOpen
- `mobileMenu` -- isOpen

### Component organization

- Domain UI: `components/<domain>/` (feed, profile, chat, search, notifications, layout)
- Shared UI primitives: `components/ui/` (shadcn/ui -- Button, Input, Dialog, Card, Avatar, etc.)
- Common utilities: `components/common/` (ErrorBoundary, LoadingScreen, LoadMoreButton, PostGridItem)
- Auth guard: `components/auth/` (ProtectedRoute)
- Page-level composition: `pages/`
- Layout shells: `layouts/` (AppShell wraps sidebar + overlays; AuthLayout wraps auth forms)

## Backend architecture

### Layered structure

- **Routes** -- define endpoints, attach Zod validators via `validate` middleware
- **Controllers** -- request/response orchestration, call services, return JSON
- **Services** -- business logic and data access (one service per domain)
- **Models** -- Mongoose schemas with indexes
- **Middlewares** -- require-auth, optional-auth, validate, upload (multer), error-handler, request-id

### Socket layer

- `sockets/index.ts` bootstraps Socket.io, applies JWT auth middleware, and registers all chat events inline
- No separate `events/` modules (directory exists but is empty)
- Server exposes `getIO()` to emit events (e.g., notifications) from services

## Data models (9 models)

- **User** -- username, email, hashed password, avatar, bio, etc.
- **Post** -- author, image, caption, `hashtags: string[]`
- **Comment** -- author, post, text
- **Like** -- user, post
- **CommentLike** -- user, comment
- **Follow** -- follower, following
- **Notification** -- recipient, sender, type, reference
- **Conversation** -- participants array
- **Message** -- conversation, sender, text

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
