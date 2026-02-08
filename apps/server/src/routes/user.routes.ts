import { Router } from 'express';

import * as followController from '../controllers/follow.controller';
import * as userController from '../controllers/user.controller';
import {
  optionalAuth,
  requireAuth,
  uploadAvatar,
  validate,
} from '../middlewares';
import {
  updateProfileSchema,
  usernameParamSchema,
  userPostsQuerySchema,
  userSearchQuerySchema,
} from '../validations';

export const userRouter = Router();

// ============================================================================
// Current User Routes (require auth)
// ============================================================================

/**
 * GET /users/me
 * Get current authenticated user's profile
 */
userRouter.get('/me', requireAuth, userController.getMe);

/**
 * PATCH /users/me
 * Update current user's profile (fullName, bio)
 */
userRouter.patch(
  '/me',
  requireAuth,
  validate({ body: updateProfileSchema }),
  userController.updateMe,
);

/**
 * POST /users/me/avatar
 * Upload and update avatar
 */
userRouter.post(
  '/me/avatar',
  requireAuth,
  uploadAvatar('avatar'),
  userController.updateAvatar,
);

/**
 * DELETE /users/me
 * Delete current user's account and all associated data
 */
userRouter.delete('/me', requireAuth, userController.deleteMe);

// ============================================================================
// Search Users (must be before :username route)
// ============================================================================

/**
 * GET /users/search
 * Search users by username or fullName
 */
userRouter.get(
  '/search',
  validate({ query: userSearchQuerySchema }),
  userController.searchUsers,
);

// ============================================================================
// Public User Routes
// ============================================================================

/**
 * GET /users/:username
 * Get user profile by username
 * Includes isFollowing status if authenticated
 */
userRouter.get(
  '/:username',
  optionalAuth,
  validate({ params: usernameParamSchema }),
  userController.getUser,
);

/**
 * GET /users/:username/posts
 * Get user's posts with pagination
 */
userRouter.get(
  '/:username/posts',
  validate({ params: usernameParamSchema, query: userPostsQuerySchema }),
  userController.getUserPosts,
);

// ============================================================================
// Follow Routes
// ============================================================================

/**
 * POST /users/:username/follow
 * Follow a user (requires auth)
 */
userRouter.post(
  '/:username/follow',
  requireAuth,
  validate({ params: usernameParamSchema }),
  followController.followUser,
);

/**
 * DELETE /users/:username/follow
 * Unfollow a user (requires auth)
 */
userRouter.delete(
  '/:username/follow',
  requireAuth,
  validate({ params: usernameParamSchema }),
  followController.unfollowUser,
);

/**
 * GET /users/:username/followers
 * Get user's followers with pagination
 */
userRouter.get(
  '/:username/followers',
  validate({ params: usernameParamSchema, query: userPostsQuerySchema }),
  followController.getFollowers,
);

/**
 * GET /users/:username/following
 * Get users that user is following with pagination
 */
userRouter.get(
  '/:username/following',
  validate({ params: usernameParamSchema, query: userPostsQuerySchema }),
  followController.getFollowing,
);
