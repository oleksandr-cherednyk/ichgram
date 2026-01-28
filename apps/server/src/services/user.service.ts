import { Types } from 'mongoose';

import { PostModel, UserModel } from '../models';
import {
  createApiError,
  decodeCursor,
  deleteFile,
  encodeCursor,
  parseLimit,
  type PaginationResult,
} from '../utils';
import type { UpdateProfileInput } from '../validations';
import { getFollowersCount, getFollowingCount } from './follow.service';

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
  postsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
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
// Get Current User (with full details)
// ============================================================================

/**
 * Get current authenticated user's profile
 */
export const getCurrentUser = async (userId: string): Promise<UserProfile> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  // Count posts and follows in parallel
  const [postsCount, followersCount, followingCount] = await Promise.all([
    PostModel.countDocuments({ authorId: userId }),
    getFollowersCount(userId),
    getFollowingCount(userId),
  ]);

  return {
    id: user._id.toString(),
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    postsCount,
    followersCount,
    followingCount,
    createdAt: user.createdAt.toISOString(),
  };
};

// ============================================================================
// Get User by Username
// ============================================================================

/**
 * Get user profile by username (public)
 */
export const getUserByUsername = async (
  username: string,
): Promise<UserProfile> => {
  const user = await UserModel.findOne({ username });

  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  const userId = user._id.toString();

  // Count posts and follows in parallel
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
    postsCount,
    followersCount,
    followingCount,
    createdAt: user.createdAt.toISOString(),
  };
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
  const updateData: Partial<{ fullName: string; bio: string }> = {};

  if (input.fullName !== undefined) {
    updateData.fullName = input.fullName;
  }
  if (input.bio !== undefined) {
    updateData.bio = input.bio;
  }

  const user = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  });

  if (!user) {
    throw createApiError(404, 'NOT_FOUND', 'User not found');
  }

  // Count posts and follows in parallel
  const [postsCount, followersCount, followingCount] = await Promise.all([
    PostModel.countDocuments({ authorId: userId }),
    getFollowersCount(userId),
    getFollowingCount(userId),
  ]);

  return {
    id: user._id.toString(),
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    postsCount,
    followersCount,
    followingCount,
    createdAt: user.createdAt.toISOString(),
  };
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
  const oldUser = await UserModel.findById(userId);
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

  // Count posts and follows in parallel
  const [postsCount, followersCount, followingCount] = await Promise.all([
    PostModel.countDocuments({ authorId: userId }),
    getFollowersCount(userId),
    getFollowingCount(userId),
  ]);

  return {
    id: user._id.toString(),
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    postsCount,
    followersCount,
    followingCount,
    createdAt: user.createdAt.toISOString(),
  };
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
  const user = await UserModel.findOne({ username });

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
    .select('imageUrl likeCount commentCount createdAt');

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
