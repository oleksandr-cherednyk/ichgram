import type { Types } from 'mongoose';

import { PostModel } from '../models';
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
 */
export const getPostById = async (postId: string): Promise<PostWithAuthor> => {
  const post = await PostModel.findById(postId).populate(
    'authorId',
    'username avatarUrl',
  );

  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  return formatPost(post as unknown as PopulatedPostDoc);
};

/**
 * Update post caption (only owner can update)
 * Automatically re-extracts hashtags from new caption
 */
export const updatePost = async (
  postId: string,
  userId: string,
  input: UpdatePostInput,
): Promise<PostWithAuthor> => {
  const post = await PostModel.findById(postId);

  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  // Check ownership
  if (post.authorId.toString() !== userId) {
    throw createApiError(403, 'FORBIDDEN', 'You can only edit your own posts');
  }

  // Extract new hashtags
  const hashtags = extractHashtags(input.caption);

  // Update post
  const updated = await PostModel.findByIdAndUpdate(
    postId,
    {
      caption: input.caption,
      hashtags,
    },
    { new: true },
  ).populate('authorId', 'username avatarUrl');

  return formatPost(updated as unknown as PopulatedPostDoc);
};

/**
 * Delete post (only owner can delete)
 * Also deletes associated image file
 * TODO: Cascade delete likes and comments in Phase 5
 */
export const deletePost = async (
  postId: string,
  userId: string,
): Promise<void> => {
  const post = await PostModel.findById(postId);

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

  // Delete post from database
  await PostModel.findByIdAndDelete(postId);

  // Delete image file (non-blocking, logs error if fails)
  void deleteFile(post.imageUrl);

  // TODO Phase 5: Delete associated likes and comments (cascade)
};

// ============================================================================
// Feed Operations (Cursor Pagination)
// ============================================================================

/**
 * Get feed posts with cursor pagination
 * Currently returns all posts sorted by creation date
 * TODO: Filter by followings in future phase
 */
export const getFeed = async (
  _userId: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<PostWithAuthor>> => {
  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  // Build query based on cursor
  const query: {
    createdAt?: { $lt: Date };
    _id?: { $ne: string };
  } = {};

  if (cursor) {
    // Get posts created before cursor timestamp
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    // Exclude the cursor post itself (tie-breaker)
    query._id = { $ne: cursor.id };
  }

  // Fetch limit + 1 to determine if there are more results
  const posts = await PostModel.find(query)
    .sort({ createdAt: -1, _id: -1 }) // Newest first, _id as tie-breaker
    .limit(limit + 1)
    .populate('authorId', 'username avatarUrl');

  // Determine if there are more results
  const hasMore = posts.length > limit;
  const data = posts.slice(0, limit);

  // Generate next cursor from last post
  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastPost = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastPost.createdAt.toISOString(),
      id: lastPost._id.toString(),
    });
  }

  return {
    data: data.map((post) => formatPost(post as unknown as PopulatedPostDoc)),
    nextCursor,
    hasMore,
  };
};

/**
 * Get explore posts with cursor pagination
 * Currently same as feed, can add randomization/filtering later
 */
export const getExplorePosts = async (
  userId: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<PostWithAuthor>> => {
  // For now, explore is the same as feed
  // TODO: Add randomization or exclude own posts in future
  return getFeed(userId, cursorParam, limitParam);
};
