import { type Request, type Response } from 'express';

import * as tagService from '../services/tag.service';
import type { TagParam, TagPostsQuery, TagSearchQuery } from '../validations';

/**
 * GET /tags/search
 * Search tags by partial match
 */
export const searchTags = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { q, limit } = req.query as unknown as TagSearchQuery;

  const result = await tagService.searchTags(q, limit);

  res.json(result);
};

/**
 * GET /tags/:tag/posts
 * Get posts by hashtag with pagination
 */
export const getPostsByTag = async (
  req: Request<TagParam, object, object, TagPostsQuery>,
  res: Response,
): Promise<void> => {
  const { tag } = req.params;
  const { cursor, limit } = req.query;

  const result = await tagService.getPostsByTag(tag, cursor, limit);

  res.json(result);
};
