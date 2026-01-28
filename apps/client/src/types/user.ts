/**
 * User profile data
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
export type UserPostItem = {
  id: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
};

/**
 * Paginated response
 */
export type PaginatedResponse<T> = {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Update profile input
 */
export type UpdateProfileInput = {
  fullName?: string;
  bio?: string;
};
