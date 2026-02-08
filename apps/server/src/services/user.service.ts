import { Types } from 'mongoose';

import {
  CommentModel,
  CommentLikeModel,
  ConversationModel,
  FollowModel,
  LikeModel,
  MessageModel,
  NotificationModel,
  PostModel,
  UserModel,
} from '../models';
import {
  createApiError,
  decodeCursor,
  deleteFile,
  encodeCursor,
  parseLimit,
  type PaginationResult,
} from '../utils';
import type { UpdateProfileInput } from '../validations';
import {
  getFollowersCount,
  getFollowingCount,
  isFollowing,
} from './follow.service';

// ============================================================================
// Types
// ============================================================================

/**
 * Public user profile (safe to expose)
 */
export type UserProfile = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
};

/**
 * User search result item
 */
export type SearchUserItem = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

/**
 * Post in user's grid
 */
type UserPostItem = {
  id: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a UserProfile from a Mongoose user document.
 * Fetches postsCount, followersCount, followingCount in parallel.
 */
const buildUserProfile = async (user: {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  createdAt: Date;
}): Promise<UserProfile> => {
  const userId = user._id.toString();

  const [postsCount, followersCount, followingCount] = await Promise.all([
    PostModel.countDocuments({ authorId: user._id }),
    getFollowersCount(userId),
    getFollowingCount(userId),
  ]);

  return {
    id: userId,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    website: user.website ?? null,
    postsCount,
    followersCount,
    followingCount,
    createdAt: user.createdAt.toISOString(),
  };
};

// ============================================================================
// Get Current User (with full details)
// ============================================================================

/**
 * Get current authenticated user's profile
 */
export const getCurrentUser = async (userId: string): Promise<UserProfile> => {
  const user = await UserModel.findById(userId).lean();

  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  return buildUserProfile(user);
};

// ============================================================================
// Get User by Username
// ============================================================================

/**
 * User profile with optional isFollowing field
 */
export type UserProfileWithFollow = UserProfile & {
  isFollowing?: boolean;
};

/**
 * Get user profile by username (public)
 * If currentUserId is provided, includes isFollowing status
 */
export const getUserByUsername = async (
  username: string,
  currentUserId?: string,
): Promise<UserProfileWithFollow> => {
  const user = await UserModel.findOne({ username }).lean();

  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const userId = user._id.toString();
  const profile: UserProfileWithFollow = await buildUserProfile(user);

  // Add isFollowing if current user is authenticated and viewing another profile
  if (currentUserId && currentUserId !== userId) {
    profile.isFollowing = await isFollowing(currentUserId, userId);
  }

  return profile;
};

// ============================================================================
// Update Profile
// ============================================================================

/**
 * Update current user's profile (fullName, bio)
 */
export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput,
): Promise<UserProfile> => {
  const updateData: Partial<{
    fullName: string;
    bio: string;
    website: string;
  }> = {};

  if (input.fullName !== undefined) {
    updateData.fullName = input.fullName;
  }
  if (input.bio !== undefined) {
    updateData.bio = input.bio;
  }
  if (input.website !== undefined) {
    updateData.website = input.website;
  }

  const user = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  });

  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  return buildUserProfile(user);
};

// ============================================================================
// Update Avatar
// ============================================================================

/**
 * Update user's avatar
 */
export const updateAvatar = async (
  userId: string,
  avatarUrl: string,
): Promise<UserProfile> => {
  // Get old avatar to delete
  const oldUser = await UserModel.findById(userId).lean();
  const oldAvatarUrl = oldUser?.avatarUrl;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { avatarUrl },
    { new: true },
  );

  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  // Delete old avatar file (non-blocking)
  if (oldAvatarUrl) {
    void deleteFile(oldAvatarUrl);
  }

  return buildUserProfile(user);
};

// ============================================================================
// Get User Posts
// ============================================================================

/**
 * Get posts by username with cursor pagination
 */
export const getUserPosts = async (
  username: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<UserPostItem>> => {
  // Find user first
  const user = await UserModel.findOne({ username }).lean();

  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  // Build query
  const query: {
    authorId: Types.ObjectId;
    createdAt?: { $lt: Date };
    _id?: { $ne: Types.ObjectId };
  } = { authorId: user._id };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: new Types.ObjectId(cursor.id) };
  }

  // Fetch posts
  const posts = await PostModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select('imageUrl likeCount commentCount createdAt')
    .lean();

  // Determine if there are more results
  const hasMore = posts.length > limit;
  const data = posts.slice(0, limit);

  // Generate next cursor
  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastPost = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastPost.createdAt.toISOString(),
      id: lastPost._id.toString(),
    });
  }

  return {
    data: data.map((post) => ({
      id: post._id.toString(),
      imageUrl: post.imageUrl,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
    })),
    nextCursor,
    hasMore,
  };
};

// ============================================================================
// Search Users
// ============================================================================

/**
 * Search users by username or fullName
 */
export const searchUsers = async (
  searchQuery: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<SearchUserItem>> => {
  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  // Build base query
  const query: Record<string, unknown> = {};

  if (searchQuery) {
    // Escape special regex characters
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Search by username or fullName (case-insensitive)
    query.$or = [
      { username: { $regex: escapedQuery, $options: 'i' } },
      { fullName: { $regex: escapedQuery, $options: 'i' } },
    ];
  }

  // Add cursor pagination filter
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: new Types.ObjectId(cursor.id) };
  }

  // Fetch users
  const users = await UserModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select('username fullName avatarUrl createdAt')
    .lean();

  // Determine if there are more results
  const hasMore = users.length > limit;
  const data = users.slice(0, limit);

  // Generate next cursor
  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastUser = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastUser.createdAt.toISOString(),
      id: lastUser._id.toString(),
    });
  }

  return {
    data: data.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? null,
    })),
    nextCursor,
    hasMore,
  };
};

// ============================================================================
// Delete Account
// ============================================================================

/**
 * Delete user account and all associated data.
 * Cascade: posts (+ their likes/comments/comment-likes/notifications/images),
 * user's comments on other posts, user's likes, comment-likes,
 * follows, notifications, conversations, messages, avatar.
 */
export const deleteAccount = async (userId: string): Promise<void> => {
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const userObjectId = user._id;

  // --- 1. Delete user's own posts (with full cascade per post) ---
  const userPosts = await PostModel.find({ authorId: userObjectId })
    .select('_id imageUrl')
    .lean();

  if (userPosts.length > 0) {
    const postIds = userPosts.map((p) => p._id);

    // Get all comment IDs on user's posts (for comment-like cleanup)
    const commentIdsOnUserPosts = await CommentModel.find({
      postId: { $in: postIds },
    }).distinct('_id');

    await Promise.all([
      LikeModel.deleteMany({ postId: { $in: postIds } }),
      CommentLikeModel.deleteMany({
        commentId: { $in: commentIdsOnUserPosts },
      }),
      CommentModel.deleteMany({ postId: { $in: postIds } }),
      NotificationModel.deleteMany({ postId: { $in: postIds } }),
      PostModel.deleteMany({ authorId: userObjectId }),
    ]);

    // Delete post images (non-blocking)
    for (const post of userPosts) {
      void deleteFile(post.imageUrl);
    }
  }

  // --- 2. Delete user's comments on OTHER posts (adjust commentCount) ---
  const userComments = await CommentModel.find({ authorId: userId })
    .select('_id postId')
    .lean();

  if (userComments.length > 0) {
    const commentIds = userComments.map((c) => c._id);

    // Decrement commentCount per affected post
    const postIdCounts = new Map<string, number>();
    for (const comment of userComments) {
      const pid = comment.postId.toString();
      postIdCounts.set(pid, (postIdCounts.get(pid) ?? 0) + 1);
    }

    const commentCountUpdates = [...postIdCounts.entries()].map(
      ([postId, count]) =>
        PostModel.updateOne(
          { _id: postId },
          { $inc: { commentCount: -count } },
        ),
    );

    await Promise.all([
      CommentLikeModel.deleteMany({ commentId: { $in: commentIds } }),
      CommentModel.deleteMany({ authorId: userId }),
      ...commentCountUpdates,
    ]);
  }

  // --- 3. Delete user's likes on other posts (adjust likeCount) ---
  const userLikes = await LikeModel.find({ userId }).select('postId').lean();

  if (userLikes.length > 0) {
    const likePostCounts = new Map<string, number>();
    for (const like of userLikes) {
      const pid = like.postId.toString();
      likePostCounts.set(pid, (likePostCounts.get(pid) ?? 0) + 1);
    }

    const likeCountUpdates = [...likePostCounts.entries()].map(
      ([postId, count]) =>
        PostModel.updateOne({ _id: postId }, { $inc: { likeCount: -count } }),
    );

    await Promise.all([LikeModel.deleteMany({ userId }), ...likeCountUpdates]);
  }

  // --- 4. Delete user's comment-likes (adjust comment likeCount) ---
  const userCommentLikes = await CommentLikeModel.find({ userId })
    .select('commentId')
    .lean();

  if (userCommentLikes.length > 0) {
    const commentLikeCounts = new Map<string, number>();
    for (const cl of userCommentLikes) {
      const cid = cl.commentId.toString();
      commentLikeCounts.set(cid, (commentLikeCounts.get(cid) ?? 0) + 1);
    }

    const clUpdates = [...commentLikeCounts.entries()].map(
      ([commentId, count]) =>
        CommentModel.updateOne(
          { _id: commentId },
          { $inc: { likeCount: -count } },
        ),
    );

    await Promise.all([CommentLikeModel.deleteMany({ userId }), ...clUpdates]);
  }

  // --- 5. Delete follows (both directions) ---
  await FollowModel.deleteMany({
    $or: [{ followerId: userId }, { followingId: userId }],
  });

  // --- 6. Delete notifications (as recipient and as actor) ---
  await NotificationModel.deleteMany({
    $or: [{ userId }, { actorId: userId }],
  });

  // --- 7. Delete conversations and messages ---
  const conversations = await ConversationModel.find({
    participantIds: userObjectId,
  })
    .select('_id')
    .lean();

  if (conversations.length > 0) {
    const conversationIds = conversations.map((c) => c._id);
    await Promise.all([
      MessageModel.deleteMany({ conversationId: { $in: conversationIds } }),
      ConversationModel.deleteMany({ _id: { $in: conversationIds } }),
    ]);
  }

  // --- 8. Delete avatar file (non-blocking) ---
  if (user.avatarUrl) {
    void deleteFile(user.avatarUrl);
  }

  // --- 9. Delete user ---
  await UserModel.findByIdAndDelete(userId);
};
