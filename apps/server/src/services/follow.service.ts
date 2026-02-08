import { FollowModel, UserModel } from '../models';
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
 * User item in followers/following list
 */
export type FollowUser = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

// ============================================================================
// Follow / Unfollow
// ============================================================================

/**
 * Follow a user
 * Returns true if followed, false if already following
 */
export const followUser = async (
  followerId: string,
  targetUsername: string,
): Promise<{ followed: boolean }> => {
  // Find target user
  const targetUser = await UserModel.findOne({
    username: targetUsername,
  }).lean();
  if (!targetUser) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const followingId = targetUser._id.toString();

  // Can't follow yourself
  if (followerId === followingId) {
    throw createApiError(400, 'BAD_REQUEST', 'You cannot follow yourself');
  }

  // Check if already following
  const existing = await FollowModel.findOne({
    followerId,
    followingId,
  }).lean();
  if (existing) {
    return { followed: false }; // Already following
  }

  // Create follow
  await FollowModel.create({ followerId, followingId });

  await createNotification({
    userId: followingId,
    actorId: followerId,
    type: 'follow',
  });

  return { followed: true };
};

/**
 * Unfollow a user
 * Returns true if unfollowed, false if wasn't following
 */
export const unfollowUser = async (
  followerId: string,
  targetUsername: string,
): Promise<{ unfollowed: boolean }> => {
  // Find target user
  const targetUser = await UserModel.findOne({
    username: targetUsername,
  }).lean();
  if (!targetUser) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const followingId = targetUser._id.toString();

  // Delete follow
  const result = await FollowModel.deleteOne({ followerId, followingId });

  return { unfollowed: result.deletedCount > 0 };
};

/**
 * Check if user is following another user
 */
export const isFollowing = async (
  followerId: string,
  followingId: string,
): Promise<boolean> => {
  const exists = await FollowModel.exists({ followerId, followingId });
  return exists !== null;
};

// ============================================================================
// Followers / Following Lists
// ============================================================================

/**
 * Get followers of a user with pagination
 */
export const getFollowers = async (
  username: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<FollowUser>> => {
  // Find user
  const user = await UserModel.findOne({ username }).lean();
  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  // Build query
  const query: {
    followingId: string;
    createdAt?: { $lt: Date };
    _id?: { $ne: string };
  } = { followingId: user._id.toString() };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: cursor.id };
  }

  // Fetch follows with populated follower
  const follows = await FollowModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('followerId', 'username fullName avatarUrl')
    .lean();

  // Determine if there are more
  const hasMore = follows.length > limit;
  const data = follows.slice(0, limit);

  // Generate next cursor
  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastFollow = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastFollow.createdAt.toISOString(),
      id: lastFollow._id.toString(),
    });
  }

  return {
    data: data
      .filter((follow) => follow.followerId != null)
      .map((follow) => {
        const follower = follow.followerId as unknown as {
          _id: { toString(): string };
          username: string;
          fullName: string;
          avatarUrl?: string;
        };
        return {
          id: follower._id.toString(),
          username: follower.username,
          fullName: follower.fullName,
          avatarUrl: follower.avatarUrl ?? null,
        };
      }),
    nextCursor,
    hasMore,
  };
};

/**
 * Get users that a user is following with pagination
 */
export const getFollowing = async (
  username: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<FollowUser>> => {
  // Find user
  const user = await UserModel.findOne({ username }).lean();
  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  // Build query
  const query: {
    followerId: string;
    createdAt?: { $lt: Date };
    _id?: { $ne: string };
  } = { followerId: user._id.toString() };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: cursor.id };
  }

  // Fetch follows with populated following
  const follows = await FollowModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('followingId', 'username fullName avatarUrl')
    .lean();

  // Determine if there are more
  const hasMore = follows.length > limit;
  const data = follows.slice(0, limit);

  // Generate next cursor
  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastFollow = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastFollow.createdAt.toISOString(),
      id: lastFollow._id.toString(),
    });
  }

  return {
    data: data
      .filter((follow) => follow.followingId != null)
      .map((follow) => {
        const following = follow.followingId as unknown as {
          _id: { toString(): string };
          username: string;
          fullName: string;
          avatarUrl?: string;
        };
        return {
          id: following._id.toString(),
          username: following.username,
          fullName: following.fullName,
          avatarUrl: following.avatarUrl ?? null,
        };
      }),
    nextCursor,
    hasMore,
  };
};

// ============================================================================
// Counts
// ============================================================================

/**
 * Get followers count for a user
 */
export const getFollowersCount = async (userId: string): Promise<number> => {
  return FollowModel.countDocuments({ followingId: userId });
};

/**
 * Get following count for a user
 */
export const getFollowingCount = async (userId: string): Promise<number> => {
  return FollowModel.countDocuments({ followerId: userId });
};
