import type { Types } from 'mongoose';

import { CommentLikeModel, CommentModel, PostModel } from '../models';
import { createNotification } from './notification.service';
import {
  createApiError,
  decodeCursor,
  encodeCursor,
  parseLimit,
  type PaginationResult,
} from '../utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Author info returned with comments
 */
type CommentAuthor = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

/**
 * Comment response with populated author
 */
export type CommentWithAuthor = {
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
 * Mongoose comment document with populated author (for internal use)
 */
type PopulatedCommentDoc = {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  authorId: {
    _id: Types.ObjectId;
    username: string;
    avatarUrl?: string;
  };
  text: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format Mongoose comment document to API response shape
 */
const formatComment = (
  comment: PopulatedCommentDoc,
  isLiked = false,
): CommentWithAuthor => ({
  id: comment._id.toString(),
  postId: comment.postId.toString(),
  authorId: comment.authorId._id.toString(),
  author: {
    id: comment.authorId._id.toString(),
    username: comment.authorId.username,
    avatarUrl: comment.authorId.avatarUrl ?? null,
  },
  text: comment.text,
  likeCount: comment.likeCount ?? 0,
  isLiked,
  createdAt: comment.createdAt.toISOString(),
  updatedAt: comment.updatedAt.toISOString(),
});

/**
 * Batch check which comments a user has liked
 */
const getCommentLikeStatus = async (
  userId: string,
  commentIds: string[],
): Promise<Set<string>> => {
  if (!userId || commentIds.length === 0) return new Set();

  const likes = await CommentLikeModel.find({
    userId,
    commentId: { $in: commentIds },
  }).lean();

  return new Set(likes.map((l) => l.commentId.toString()));
};

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a comment on a post
 * Also increments post.commentCount
 */
export const createComment = async (
  userId: string,
  postId: string,
  text: string,
): Promise<CommentWithAuthor> => {
  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  // Create comment
  const comment = await CommentModel.create({
    postId,
    authorId: userId,
    text,
  });

  // Increment comment count
  await PostModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

  if (post.authorId.toString() !== userId) {
    await createNotification({
      userId: post.authorId.toString(),
      actorId: userId,
      type: 'comment',
      postId,
      commentId: comment._id.toString(),
    });
  }

  // Populate author and return formatted comment
  const populated = await comment.populate('authorId', 'username avatarUrl');
  return formatComment(populated as unknown as PopulatedCommentDoc, false);
};

/**
 * Delete a comment (only author can delete)
 * Also decrements post.commentCount
 */
export const deleteComment = async (
  userId: string,
  commentId: string,
): Promise<void> => {
  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    throw createApiError(404, 'NOT_FOUND', 'Comment not found');
  }

  // Check ownership
  if (comment.authorId.toString() !== userId) {
    throw createApiError(
      403,
      'FORBIDDEN',
      'You can only delete your own comments',
    );
  }

  // Delete comment and its likes
  await CommentLikeModel.deleteMany({ commentId });
  await CommentModel.findByIdAndDelete(commentId);

  // Decrement comment count (ensure it doesn't go below 0)
  await PostModel.updateOne(
    { _id: comment.postId, commentCount: { $gt: 0 } },
    { $inc: { commentCount: -1 } },
  );
};

/**
 * Get comments for a post with cursor pagination
 * Sorted by creation date (newest first)
 */
export const getPostComments = async (
  postId: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
  userId?: string | null,
): Promise<PaginationResult<CommentWithAuthor>> => {
  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  // Build query
  const query: {
    postId: string;
    createdAt?: { $lt: Date };
    _id?: { $ne: string };
  } = { postId };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: cursor.id };
  }

  // Fetch limit + 1 to determine if there are more results
  const comments = await CommentModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('authorId', 'username avatarUrl');

  // Determine if there are more results
  const hasMore = comments.length > limit;
  const data = comments.slice(0, limit);

  // Generate next cursor from last comment
  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastComment = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastComment.createdAt.toISOString(),
      id: lastComment._id.toString(),
    });
  }

  // Get like status for current user
  const commentIds = data.map((c) => c._id.toString());
  const likedSet = userId
    ? await getCommentLikeStatus(userId, commentIds)
    : new Set<string>();

  return {
    data: data.map((comment) =>
      formatComment(
        comment as unknown as PopulatedCommentDoc,
        likedSet.has(comment._id.toString()),
      ),
    ),
    nextCursor,
    hasMore,
  };
};

// ============================================================================
// Comment Like Operations
// ============================================================================

/**
 * Like a comment
 */
export const likeComment = async (
  userId: string,
  commentId: string,
): Promise<{ liked: boolean }> => {
  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw createApiError(404, 'NOT_FOUND', 'Comment not found');
  }

  try {
    await CommentLikeModel.create({ commentId, userId });
    await CommentModel.findByIdAndUpdate(commentId, {
      $inc: { likeCount: 1 },
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return { liked: true };
    }
    throw error;
  }

  return { liked: true };
};

/**
 * Unlike a comment
 */
export const unlikeComment = async (
  userId: string,
  commentId: string,
): Promise<{ liked: boolean }> => {
  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw createApiError(404, 'NOT_FOUND', 'Comment not found');
  }

  const deleted = await CommentLikeModel.findOneAndDelete({
    commentId,
    userId,
  });

  if (deleted) {
    await CommentModel.updateOne(
      { _id: commentId, likeCount: { $gt: 0 } },
      { $inc: { likeCount: -1 } },
    );
  }

  return { liked: false };
};
