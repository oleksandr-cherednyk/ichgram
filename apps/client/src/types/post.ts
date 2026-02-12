/**
 * Post author info (embedded in feed posts)
 */
type PostAuthor = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

/**
 * Full post data for feed display
 */
export type FeedPost = {
  id: string;
  author: PostAuthor;
  caption: string;
  imageUrl: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
};

/**
 * Comment author info
 */
type CommentAuthor = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

/**
 * Comment data
 */
export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  author: CommentAuthor;
  text: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Response from GET /api/posts/:id/comments
 */
export type CommentsResponse = {
  data: Comment[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Response from POST /api/posts/:id/comments
 */
export type CreateCommentResponse = {
  comment: Comment;
};

/**
 * Response from POST /api/posts
 */
export type CreatePostResponse = {
  post: FeedPost;
};

/**
 * Response from GET /api/posts/feed (cursor-based, used by explore)
 */
export type FeedResponse = {
  data: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Last comment preview in home feed
 */
type FeedLastComment = {
  authorUsername: string;
  text: string;
};

/**
 * Home feed post with isLiked and last comment
 */
export type HomeFeedPost = FeedPost & {
  isLiked: boolean;
  lastComment: FeedLastComment | null;
};

/**
 * Response from GET /api/posts/feed (home feed, sample-based)
 */
export type HomeFeedResponse = {
  data: HomeFeedPost[];
  hasMore: boolean;
};

/**
 * Response from like/unlike post or comment
 */
export type LikeResponse = {
  liked: boolean;
};

/**
 * Params for like/unlike comment
 */
export type CommentActionParams = {
  postId: string;
  commentId: string;
};
