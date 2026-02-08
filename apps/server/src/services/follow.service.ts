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

type PopulatedFollowUser = {
  _id: { toString(): string };
  username: string;
  fullName: string;
  avatarUrl?: string;
};

const getFollowList = async (
  username: string,
  direction: 'followers' | 'following',
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<FollowUser>> => {
  const user = await UserModel.findOne({ username }).lean();
  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  const isFollowers = direction === 'followers';
  const queryField = isFollowers ? 'followingId' : 'followerId';
  const populateField = isFollowers ? 'followerId' : 'followingId';

  const query: Record<string, unknown> = {
    [queryField]: user._id.toString(),
  };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: cursor.id };
  }

  const follows = await FollowModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate(populateField, 'username fullName avatarUrl')
    .lean();

  const hasMore = follows.length > limit;
  const data = follows.slice(0, limit);

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
      .filter(
        (follow) =>
          (follow as unknown as Record<string, unknown>)[populateField] != null,
      )
      .map((follow) => {
        const populated = (follow as unknown as Record<string, unknown>)[
          populateField
        ] as PopulatedFollowUser;
        return {
          id: populated._id.toString(),
          username: populated.username,
          fullName: populated.fullName,
          avatarUrl: populated.avatarUrl ?? null,
        };
      }),
    nextCursor,
    hasMore,
  };
};

export const getFollowers = (
  username: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
) => getFollowList(username, 'followers', cursorParam, limitParam);

export const getFollowing = (
  username: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
) => getFollowList(username, 'following', cursorParam, limitParam);

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
