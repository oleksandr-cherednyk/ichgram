import type { UserPostItem } from './user';

/**
 * User search result item
 */
export type SearchUser = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

/**
 * Tag search result item
 */
export type SearchTag = {
  tag: string;
  postsCount: number;
};

/**
 * Response from GET /api/users/search
 */
export type SearchUsersResponse = {
  data: SearchUser[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Response from GET /api/tags/search
 */
export type SearchTagsResponse = {
  data: SearchTag[];
};

/**
 * Response from GET /api/tags/:tag/posts
 */
export type TagPostsResponse = {
  data: UserPostItem[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
};
