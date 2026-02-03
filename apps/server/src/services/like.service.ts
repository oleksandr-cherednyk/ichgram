import { LikeModel, PostModel } from '../models';
import { createNotification } from './notification.service';
import { createApiError } from '../utils';

/**
 * Like a post
 * Creates a like record and increments post.likeCount
 * Returns true if new like created, false if already exists
 */
export const likePost = async (
  userId: string,
  postId: string,
): Promise<boolean> => {
  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  // Try to create like (unique index will prevent duplicates)
  try {
    await LikeModel.create({ userId, postId });

    // Increment like count
    await PostModel.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

    if (post.authorId.toString() !== userId) {
      await createNotification({
        userId: post.authorId.toString(),
        actorId: userId,
        type: 'like',
        postId,
      });
    }

    return true; // New like created
  } catch (error) {
    // Duplicate key error means like already exists
    if ((error as { code?: number }).code === 11000) {
      return false; // Already liked
    }
    throw error;
  }
};

/**
 * Unlike a post
 * Removes like record and decrements post.likeCount
 * Returns true if like was removed, false if didn't exist
 */
export const unlikePost = async (
  userId: string,
  postId: string,
): Promise<boolean> => {
  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    throw createApiError(404, 'NOT_FOUND', 'Post not found');
  }

  // Try to delete the like
  const result = await LikeModel.findOneAndDelete({ userId, postId });

  if (result) {
    // Decrement like count (ensure it doesn't go below 0)
    await PostModel.updateOne(
      { _id: postId, likeCount: { $gt: 0 } },
      { $inc: { likeCount: -1 } },
    );
    return true; // Like removed
  }

  return false; // Like didn't exist
};

/**
 * Check if a user has liked a specific post
 */
export const isPostLikedByUser = async (
  userId: string,
  postId: string,
): Promise<boolean> => {
  const like = await LikeModel.findOne({ userId, postId });
  return !!like;
};

/**
 * Batch check if user has liked multiple posts
 * Returns a set of liked post IDs
 */
export const getPostLikeStatus = async (
  userId: string,
  postIds: string[],
): Promise<Set<string>> => {
  if (postIds.length === 0) {
    return new Set();
  }

  const likes = await LikeModel.find({
    userId,
    postId: { $in: postIds },
  }).select('postId');

  return new Set(likes.map((like) => like.postId.toString()));
};
