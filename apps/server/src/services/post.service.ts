import { Types } from 'mongoose';

import {
  CommentModel,
  CommentLikeModel,
  FollowModel,
  LikeModel,
  NotificationModel,
  PostModel,
} from '../models';
import {
  createApiError,
  decodeCursor,
  deleteFile,
  encodeCursor,
  extractHashtags,
  parseLimit,
  type PaginationResult,
} from '../utils';
import type { CreatePostInput, UpdatePostInput } from '../validations';
import { getPostLikeStatus, isPostLikedByUser } from './like.service';

// ============================================================================
// Types
// ============================================================================

/**
 * Author info returned with posts
 */
type PostAuthor = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

/**
 * Full post response with populated author
 */
export type PostWithAuthor = {
  id: string;
  authorId: string;
  author: PostAuthor;
  caption: string;
  imageUrl: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Mongoose post document with populated author (for internal use)
 */
type PopulatedPostDoc = {
  _id: Types.ObjectId;
  authorId: {
    _id: Types.ObjectId;
    username: string;
    avatarUrl?: string;
  };
  caption: string;
  imageUrl: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Last comment preview for feed cards
 */
type FeedLastComment = {
  authorUsername: string;
  text: string;
};

/**
 * Feed post with isLiked and last comment
 */
export type FeedPostItem = PostWithAuthor & {
  isLiked: boolean;
  lastComment: FeedLastComment | null;
};

type FeedResult = {
  data: FeedPostItem[];
  hasMore: boolean;
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format Mongoose post document to API response shape
 */
const formatPost = (post: PopulatedPostDoc): PostWithAuthor => ({
  id: post._id.toString(),
  authorId: post.authorId._id.toString(),
  author: {
    id: post.authorId._id.toString(),
    username: post.authorId.username,
    avatarUrl: post.authorId.avatarUrl ?? null,
  },
  caption: post.caption,
  imageUrl: post.imageUrl,
  hashtags: post.hashtags,
  likeCount: post.likeCount,
  commentCount: post.commentCount,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
});

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new post with image and caption
 * Automatically extracts and normalizes hashtags
 */
export const createPost = async (
  userId: string,
  input: CreatePostInput,
  imageUrl: string,
): Promise<PostWithAuthor> => {
  // Extract and normalize hashtags from caption
  const hashtags = extractHashtags(input.caption ?? '');

  // Create post
  const post = await PostModel.create({
    authorId: userId,
    caption: input.caption ?? '',
    imageUrl,
    hashtags,
  });

  // Populate author and return formatted post
  const populated = await post.populate('authorId', 'username avatarUrl');
  return formatPost(populated as unknown as PopulatedPostDoc);
};

/**
 * Get post by ID with author details
 * Used for post modal view
 * If userId is provided, includes isLiked status
 */
export const getPostById = async (
  postId: string,
  userId?: string,
): Promise<PostWithAuthor> => {
  const post = await PostModel.findById(postId)
    .populate('authorId', 'username avatarUrl')
    .lean();

  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  const formattedPost = formatPost(post as unknown as PopulatedPostDoc);

  // Add isLiked if user is authenticated
  if (userId) {
    formattedPost.isLiked = await isPostLikedByUser(userId, postId);
  }

  return formattedPost;
};

/**
 * Update post caption and/or image (owner only)
 * Automatically re-extracts hashtags from new caption
 */
export const updatePost = async (
  postId: string,
  userId: string,
  input: UpdatePostInput,
  newImageUrl?: string,
): Promise<PostWithAuthor> => {
  const post = await PostModel.findById(postId).lean();

  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  // Check ownership
  if (post.authorId.toString() !== userId) {
    throw createApiError(403, 'FORBIDDEN', 'You can only edit your own posts');
  }

  const updateFields: Record<string, unknown> = {};

  if (input.caption !== undefined) {
    updateFields.caption = input.caption;
    updateFields.hashtags = extractHashtags(input.caption);
  }

  if (newImageUrl) {
    const oldImageUrl = post.imageUrl;
    updateFields.imageUrl = newImageUrl;
    // Delete old image (non-blocking)
    void deleteFile(oldImageUrl);
  }

  // Update post
  const updated = await PostModel.findByIdAndUpdate(postId, updateFields, {
    new: true,
  }).populate('authorId', 'username avatarUrl');

  return formatPost(updated as unknown as PopulatedPostDoc);
};

/**
 * Delete post (only owner can delete)
 * Cascade deletes likes, comments, comment-likes, notifications, and image file
 */
export const deletePost = async (
  postId: string,
  userId: string,
): Promise<void> => {
  const post = await PostModel.findById(postId).lean();

  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  // Check ownership
  if (post.authorId.toString() !== userId) {
    throw createApiError(
      403,
      'FORBIDDEN',
      'You can only delete your own posts',
    );
  }

  // Cascade delete associated data
  const commentIds = await CommentModel.find({ postId }).distinct('_id');
  await Promise.all([
    LikeModel.deleteMany({ postId }),
    CommentLikeModel.deleteMany({ commentId: { $in: commentIds } }),
    CommentModel.deleteMany({ postId }),
    NotificationModel.deleteMany({ postId }),
    PostModel.findByIdAndDelete(postId),
  ]);

  // Delete image file (non-blocking, logs error if fails)
  void deleteFile(post.imageUrl);
};

// ============================================================================
// Feed Operations (Cursor Pagination)
// ============================================================================

/**
 * Get feed posts — random posts from followed users
 * Uses $sample for randomization, exclude-based pagination to avoid duplicates
 */
export const getFeed = async (
  userId: string,
  excludeIds: string[] = [],
  limitParam?: number | string | null,
): Promise<FeedResult> => {
  const limit = parseLimit(limitParam);

  // Get IDs of users the current user follows
  const follows = await FollowModel.find({ followerId: userId })
    .select('followingId')
    .lean();
  const followingIds = follows.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return { data: [], hasMore: false };
  }

  // Build match filter: posts from followed users, excluding already-seen posts
  const matchFilter: Record<string, unknown> = {
    authorId: { $in: followingIds },
  };

  if (excludeIds.length > 0) {
    matchFilter._id = {
      $nin: excludeIds.map((id) => new Types.ObjectId(id)),
    };
  }

  // Count remaining posts to determine hasMore
  const totalRemaining = await PostModel.countDocuments(matchFilter);

  // Sample random posts
  const sampleSize = Math.min(limit, totalRemaining);
  if (sampleSize === 0) {
    return { data: [], hasMore: false };
  }

  const sampled = await PostModel.aggregate([
    { $match: matchFilter },
    { $sample: { size: sampleSize } },
  ]);

  // Populate author info
  const postIds = sampled.map((p: { _id: Types.ObjectId }) => p._id);
  const posts = await PostModel.find({ _id: { $in: postIds } })
    .populate('authorId', 'username avatarUrl')
    .lean();

  // Batch fetch isLiked status
  const likeStatusMap = await getPostLikeStatus(
    userId,
    posts.map((p) => p._id.toString()),
  );

  // Batch fetch last comment per post
  const lastComments = await CommentModel.aggregate([
    { $match: { postId: { $in: postIds } } },
    { $sort: { createdAt: -1 as const } },
    { $group: { _id: '$postId', commentId: { $first: '$_id' } } },
  ]);

  const commentIds = lastComments.map(
    (c: { commentId: Types.ObjectId }) => c.commentId,
  );
  const comments = await CommentModel.find({
    _id: { $in: commentIds },
  })
    .populate('authorId', 'username')
    .lean();

  const commentMap = new Map<
    string,
    { authorUsername: string; text: string }
  >();
  for (const comment of comments) {
    if (!comment.authorId) continue;
    const author = comment.authorId as unknown as {
      _id: Types.ObjectId;
      username: string;
    };
    commentMap.set(comment.postId.toString(), {
      authorUsername: author.username,
      text: comment.text,
    });
  }

  // Format response (filter out posts with deleted authors)
  const data: FeedPostItem[] = posts
    .filter((post) => post.authorId != null)
    .map((post) => {
      const formatted = formatPost(post as unknown as PopulatedPostDoc);
      const postIdStr = post._id.toString();
      return {
        ...formatted,
        isLiked: likeStatusMap.has(postIdStr),
        lastComment: commentMap.get(postIdStr) ?? null,
      };
    });

  return {
    data,
    hasMore: totalRemaining > sampleSize,
  };
};

/**
 * Get explore posts with cursor pagination
 * Returns all posts sorted by creation date
 */
export const getExplorePosts = async (
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<PostWithAuthor>> => {
  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  const query: {
    createdAt?: { $lt: Date };
    _id?: { $ne: string };
  } = {};

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: cursor.id };
  }

  const posts = await PostModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('authorId', 'username avatarUrl')
    .lean();

  const hasMore = posts.length > limit;
  const data = posts.slice(0, limit);

  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastPost = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastPost.createdAt.toISOString(),
      id: lastPost._id.toString(),
    });
  }

  return {
    data: data
      .filter((post) => post.authorId != null)
      .map((post) => formatPost(post as unknown as PopulatedPostDoc)),
    nextCursor,
    hasMore,
  };
};

/**
 * Get top posts sorted by like count (most popular)
 * Used for the explore page grid
 */
export const getTopPosts = async (
  limit: number = 10,
): Promise<PostWithAuthor[]> => {
  const posts = await PostModel.find()
    .sort({ likeCount: -1, createdAt: -1 })
    .limit(limit + 5)
    .populate('authorId', 'username avatarUrl')
    .lean();

  return posts
    .filter((post) => post.authorId != null)
    .slice(0, limit)
    .map((post) => formatPost(post as unknown as PopulatedPostDoc));
};
