import { Types } from 'mongoose';

import { PostModel } from '../models';
import {
  decodeCursor,
  encodeCursor,
  parseLimit,
  type PaginationResult,
} from '../utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Tag search result with post count
 */
export type SearchTagItem = {
  tag: string;
  postsCount: number;
};

/**
 * Post item for tag page grid
 */
export type TagPostItem = {
  id: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
};

// ============================================================================
// Search Tags
// ============================================================================

/**
 * Search tags by partial match
 * Returns unique tags with post counts, sorted by popularity
 */
export const searchTags = async (
  searchQuery: string,
  limitParam?: number | string | null,
): Promise<{ data: SearchTagItem[] }> => {
  const limit = parseLimit(limitParam);

  // Escape special regex characters
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Aggregation: unwind hashtags, filter by regex, group and count
  const results = await PostModel.aggregate<{
    _id: string;
    postsCount: number;
  }>([
    // Unwind hashtags array to create a document per tag
    { $unwind: '$hashtags' },
    // Filter by partial match (case-insensitive)
    {
      $match: {
        hashtags: { $regex: escapedQuery, $options: 'i' },
      },
    },
    // Group by tag and count posts
    {
      $group: {
        _id: '$hashtags',
        postsCount: { $sum: 1 },
      },
    },
    // Sort by popularity (most posts first)
    { $sort: { postsCount: -1, _id: 1 } },
    // Limit results
    { $limit: limit },
  ]);

  return {
    data: results.map((result) => ({
      tag: result._id,
      postsCount: result.postsCount,
    })),
  };
};

// ============================================================================
// Get Posts by Tag
// ============================================================================

/**
 * Get posts by hashtag with cursor pagination
 */
export const getPostsByTag = async (
  tag: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<TagPostItem> & { totalCount: number }> => {
  // Normalize tag (lowercase, remove # if present)
  const normalizedTag = tag.toLowerCase().replace(/^#/, '');

  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  // Get total count for header display
  const totalCount = await PostModel.countDocuments({
    hashtags: normalizedTag,
  });

  // Build query
  const query: {
    hashtags: string;
    createdAt?: { $lt: Date };
    _id?: { $ne: Types.ObjectId };
  } = { hashtags: normalizedTag };

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
    totalCount,
  };
};
