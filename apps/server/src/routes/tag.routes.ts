import { Router } from 'express';

import * as tagController from '../controllers/tag.controller';
import { validate } from '../middlewares';
import {
  tagParamSchema,
  tagPostsQuerySchema,
  tagSearchQuerySchema,
} from '../validations';

export const tagRouter = Router();

// ============================================================================
// Tag Search
// ============================================================================

/**
 * GET /tags/search
 * Search tags by partial match
 * Returns tags sorted by post count
 */
tagRouter.get(
  '/search',
  validate({ query: tagSearchQuerySchema }),
  tagController.searchTags,
);

// ============================================================================
// Tag Posts
// ============================================================================

/**
 * GET /tags/:tag/posts
 * Get posts by hashtag with cursor pagination
 */
tagRouter.get(
  '/:tag/posts',
  validate({ params: tagParamSchema, query: tagPostsQuerySchema }),
  tagController.getPostsByTag,
);
