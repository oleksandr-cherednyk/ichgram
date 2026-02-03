import { z } from 'zod';

import { objectIdSchema } from './pagination';

/**
 * Validation schema for creating a conversation
 */
export const createConversationBodySchema = z.object({
  participantId: objectIdSchema('participant ID'),
});

/**
 * Validation schema for conversation ID param
 */
export const conversationIdParamSchema = z.object({
  conversationId: objectIdSchema('conversation ID'),
});

/**
 * Validation schema for sending a message
 */
export const sendMessageBodySchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long'),
});

// Export types
export type CreateConversationBody = z.infer<
  typeof createConversationBodySchema
>;
export type ConversationIdParam = z.infer<typeof conversationIdParamSchema>;
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
