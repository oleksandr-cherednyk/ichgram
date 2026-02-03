import { Router } from 'express';

import * as chatController from '../controllers/chat.controller';
import { requireAuth, validate } from '../middlewares';
import {
  conversationIdParamSchema,
  createConversationBodySchema,
  paginationQuerySchema,
  sendMessageBodySchema,
} from '../validations';

export const chatRouter = Router();

// All chat routes require authentication
chatRouter.use(requireAuth);

/**
 * POST /conversations
 * Find or create a conversation
 */
chatRouter.post(
  '/',
  validate({ body: createConversationBodySchema }),
  chatController.findOrCreateConversation,
);

/**
 * GET /conversations
 * List conversations with cursor pagination
 */
chatRouter.get(
  '/',
  validate({ query: paginationQuerySchema }),
  chatController.getConversations,
);

/**
 * GET /conversations/unread-count
 * Get total unread messages count
 */
chatRouter.get('/unread-count', chatController.getUnreadMessageCount);

/**
 * DELETE /conversations/:conversationId
 * Delete a conversation and its messages
 */
chatRouter.delete(
  '/:conversationId',
  validate({ params: conversationIdParamSchema }),
  chatController.deleteConversation,
);

/**
 * GET /conversations/:conversationId/messages
 * Get messages for a conversation with cursor pagination
 */
chatRouter.get(
  '/:conversationId/messages',
  validate({ params: conversationIdParamSchema, query: paginationQuerySchema }),
  chatController.getMessages,
);

/**
 * POST /conversations/:conversationId/messages
 * Send a message
 */
chatRouter.post(
  '/:conversationId/messages',
  validate({ params: conversationIdParamSchema, body: sendMessageBodySchema }),
  chatController.sendMessage,
);

/**
 * PATCH /conversations/:conversationId/read
 * Mark conversation as read
 */
chatRouter.patch(
  '/:conversationId/read',
  validate({ params: conversationIdParamSchema }),
  chatController.markConversationRead,
);
