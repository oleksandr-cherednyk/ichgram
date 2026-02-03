import { type Request, type Response } from 'express';

import * as chatService from '../services/chat.service';
import { getIO } from '../sockets';
import type {
  ConversationIdParam,
  CreateConversationBody,
  SendMessageBody,
} from '../validations';

type PaginationQuery = {
  cursor?: string;
  limit?: number;
};

/**
 * POST /conversations
 * Find or create a 1:1 conversation
 */
export const findOrCreateConversation = async (
  req: Request<object, object, CreateConversationBody>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { participantId } = req.body;

  const conversation = await chatService.findOrCreateConversation(
    userId,
    participantId,
  );

  res.status(201).json({ conversation });
};

/**
 * GET /conversations
 * List user's conversations with cursor pagination
 */
export const getConversations = async (
  req: Request<object, object, object, PaginationQuery>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { cursor, limit } = req.query;

  const result = await chatService.getConversations(userId, cursor, limit);

  res.json(result);
};

/**
 * GET /conversations/:conversationId/messages
 * Get messages for a conversation with cursor pagination
 */
export const getMessages = async (
  req: Request<ConversationIdParam, object, object, PaginationQuery>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { conversationId } = req.params;
  const { cursor, limit } = req.query;

  const result = await chatService.getMessages(
    userId,
    conversationId,
    cursor,
    limit,
  );

  res.json(result);
};

/**
 * POST /conversations/:conversationId/messages
 * Send a message in a conversation
 */
export const sendMessage = async (
  req: Request<ConversationIdParam, object, SendMessageBody>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { conversationId } = req.params;
  const { text } = req.body;

  const message = await chatService.sendMessage(userId, conversationId, text);

  await chatService.broadcastNewMessage(
    getIO(),
    conversationId,
    userId,
    message,
  );

  res.status(201).json({ message });
};

/**
 * PATCH /conversations/:conversationId/read
 * Mark conversation as read for current user
 */
export const markConversationRead = async (
  req: Request<ConversationIdParam>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { conversationId } = req.params;

  await chatService.markConversationRead(userId, conversationId);

  res.json({ ok: true });
};

/**
 * GET /conversations/unread-count
 * Get total unread messages count
 */
export const getUnreadMessageCount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const count = await chatService.getTotalUnreadCount(userId);

  res.json({ count });
};

/**
 * DELETE /conversations/:conversationId
 * Delete a conversation and its messages
 */
export const deleteConversation = async (
  req: Request<ConversationIdParam>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { conversationId } = req.params;

  await chatService.deleteConversation(userId, conversationId);

  const io = getIO();
  io.to(`user:${userId}`).emit('conversation:deleted', { conversationId });

  res.status(204).send();
};
