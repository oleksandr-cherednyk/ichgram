import { Types } from 'mongoose';
import type { Server } from 'socket.io';

import { ConversationModel, MessageModel } from '../models';
import {
  createApiError,
  decodeCursor,
  encodeCursor,
  parseLimit,
  type PaginationResult,
} from '../utils';

// ============================================================================
// Types
// ============================================================================

export type ConversationParticipant = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

export type MessageSender = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type MessageItem = {
  id: string;
  conversationId: string;
  senderId: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
};

export type ConversationItem = {
  id: string;
  participants: ConversationParticipant[];
  lastMessage: MessageItem | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
};

type PopulatedConversationDoc = {
  _id: Types.ObjectId;
  participantIds: {
    _id: Types.ObjectId;
    username: string;
    fullName: string;
    avatarUrl?: string;
  }[];
  unreadCounts?: { userId: Types.ObjectId; count: number }[];
  hiddenFor?: Types.ObjectId[];
  clearedAt?: { userId: Types.ObjectId; date: Date }[];
  lastMessageAt?: Date | null;
  createdAt: Date;
};

type PopulatedMessageDoc = {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: {
    _id: Types.ObjectId;
    username: string;
    avatarUrl?: string;
  };
  text: string;
  createdAt: Date;
};

// ============================================================================
// Utilities
// ============================================================================

const formatParticipant = (
  participant: PopulatedConversationDoc['participantIds'][number],
): ConversationParticipant => ({
  id: participant._id.toString(),
  username: participant.username,
  fullName: participant.fullName,
  avatarUrl: participant.avatarUrl ?? null,
});

const formatMessage = (message: PopulatedMessageDoc): MessageItem => ({
  id: message._id.toString(),
  conversationId: message.conversationId.toString(),
  senderId: message.senderId._id.toString(),
  sender: {
    id: message.senderId._id.toString(),
    username: message.senderId.username,
    avatarUrl: message.senderId.avatarUrl ?? null,
  },
  text: message.text,
  createdAt: message.createdAt.toISOString(),
});

const formatConversation = (
  conversation: PopulatedConversationDoc,
  currentUserId: string,
  lastMessage: PopulatedMessageDoc | null,
): ConversationItem => {
  const participants = conversation.participantIds
    .map(formatParticipant)
    .sort((a, b) => {
      if (a.id === currentUserId) return 1;
      if (b.id === currentUserId) return -1;
      return a.username.localeCompare(b.username);
    });

  const lastMessageAt =
    conversation.lastMessageAt ?? lastMessage?.createdAt ?? null;
  const unreadCount =
    conversation.unreadCounts?.find(
      (entry) => entry.userId.toString() === currentUserId,
    )?.count ?? 0;

  return {
    id: conversation._id.toString(),
    participants,
    lastMessage: lastMessage ? formatMessage(lastMessage) : null,
    lastMessageAt: lastMessageAt ? lastMessageAt.toISOString() : null,
    unreadCount,
    createdAt: conversation.createdAt.toISOString(),
  };
};

const assertParticipant = async (
  userId: string,
  conversationId: string,
): Promise<PopulatedConversationDoc> => {
  const conversation = await ConversationModel.findById(conversationId)
    .populate('participantIds', 'username fullName avatarUrl')
    .lean();

  if (!conversation) {
    throw createApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  const populated = conversation as unknown as PopulatedConversationDoc;

  const isParticipant = populated.participantIds.some(
    (participant) => participant._id.toString() === userId,
  );

  if (!isParticipant) {
    throw createApiError(
      403,
      'FORBIDDEN',
      'You are not a participant in this conversation',
    );
  }

  const isHidden =
    populated.hiddenFor?.some(
      (hiddenUserId) => hiddenUserId.toString() === userId,
    ) ?? false;

  if (isHidden) {
    throw createApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  return populated;
};

// ============================================================================
// CRUD Operations
// ============================================================================

export const findOrCreateConversation = async (
  userId: string,
  participantId: string,
): Promise<ConversationItem> => {
  if (userId === participantId) {
    throw createApiError(
      400,
      'BAD_REQUEST',
      'You cannot start a conversation with yourself',
    );
  }

  const existing = await ConversationModel.findOne({
    participantIds: {
      $all: [new Types.ObjectId(userId), new Types.ObjectId(participantId)],
      $size: 2,
    },
  })
    .populate('participantIds', 'username fullName avatarUrl')
    .lean();

  if (existing) {
    await ConversationModel.updateOne(
      { _id: existing._id },
      { $pull: { hiddenFor: new Types.ObjectId(userId) } },
    );

    const lastMessage = await MessageModel.findOne({
      conversationId: existing._id,
    })
      .sort({ createdAt: -1, _id: -1 })
      .populate('senderId', 'username avatarUrl')
      .lean();

    return formatConversation(
      existing as unknown as PopulatedConversationDoc,
      userId,
      lastMessage as unknown as PopulatedMessageDoc | null,
    );
  }

  const created = await ConversationModel.create({
    participantIds: [userId, participantId],
    unreadCounts: [
      { userId: new Types.ObjectId(userId), count: 0 },
      { userId: new Types.ObjectId(participantId), count: 0 },
    ],
    lastMessageAt: new Date(),
  });

  const populated = await created.populate(
    'participantIds',
    'username fullName avatarUrl',
  );

  return formatConversation(
    populated as unknown as PopulatedConversationDoc,
    userId,
    null,
  );
};

export const getConversations = async (
  userId: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<ConversationItem>> => {
  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  const query: {
    participantIds: Types.ObjectId;
    lastMessageAt?: { $lt: Date };
    _id?: { $ne: string };
    hiddenFor?: { $ne: Types.ObjectId };
  } = {
    participantIds: new Types.ObjectId(userId),
    hiddenFor: { $ne: new Types.ObjectId(userId) },
  };

  if (cursor) {
    query.lastMessageAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: cursor.id };
  }

  const conversations = await ConversationModel.find(query)
    .sort({ lastMessageAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('participantIds', 'username fullName avatarUrl')
    .lean();

  const hasMore = conversations.length > limit;
  const data = conversations.slice(0, limit);

  const conversationIds = data.map((conversation) => conversation._id);

  // Build a map of clearedAt dates per conversation for the current user
  const clearedAtMap = new Map<string, Date>();
  for (const conversation of data) {
    const entry = (
      conversation as unknown as PopulatedConversationDoc
    ).clearedAt?.find(
      (e: { userId: Types.ObjectId; date: Date }) =>
        e.userId.toString() === userId,
    );
    if (entry) {
      clearedAtMap.set(conversation._id.toString(), entry.date);
    }
  }

  // Fetch last messages in bulk, filtering by clearedAt per conversation
  const lastMessageMap = new Map<string, PopulatedMessageDoc>();
  if (conversationIds.length > 0) {
    const orConditions = conversationIds.map((convId) => {
      const clearedAt = clearedAtMap.get(convId.toString());
      const condition: Record<string, unknown> = { conversationId: convId };
      if (clearedAt) {
        condition.createdAt = { $gt: clearedAt };
      }
      return condition;
    });

    const aggregated = await MessageModel.aggregate([
      { $match: { $or: orConditions } },
      { $sort: { createdAt: -1 as const, _id: -1 as const } },
      {
        $group: {
          _id: '$conversationId',
          messageId: { $first: '$_id' },
        },
      },
    ]);

    if (aggregated.length > 0) {
      const messageIds = aggregated.map(
        (entry: { messageId: Types.ObjectId }) => entry.messageId,
      );
      const messages = await MessageModel.find({
        _id: { $in: messageIds },
      })
        .populate('senderId', 'username avatarUrl')
        .lean();

      for (const msg of messages) {
        lastMessageMap.set(
          msg.conversationId.toString(),
          msg as unknown as PopulatedMessageDoc,
        );
      }
    }
  }

  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastConversation = data[data.length - 1];
    const lastMessageAt =
      lastConversation.lastMessageAt ?? lastConversation.createdAt;
    nextCursor = encodeCursor({
      createdAt: lastMessageAt.toISOString(),
      id: lastConversation._id.toString(),
    });
  }

  return {
    data: data.map((conversation) =>
      formatConversation(
        conversation as unknown as PopulatedConversationDoc,
        userId,
        lastMessageMap.get(conversation._id.toString()) ?? null,
      ),
    ),
    nextCursor,
    hasMore,
  };
};

export const getMessages = async (
  userId: string,
  conversationId: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<MessageItem>> => {
  const conversation = await assertParticipant(userId, conversationId);

  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  // Find user's clearedAt timestamp to filter out older messages
  const userClearedAt = conversation.clearedAt?.find(
    (entry: { userId: Types.ObjectId; date: Date }) =>
      entry.userId.toString() === userId,
  )?.date;

  const query: Record<string, unknown> = { conversationId };

  // Only show messages after user's clearedAt
  if (userClearedAt && cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt), $gt: userClearedAt };
    query._id = { $ne: cursor.id };
  } else if (userClearedAt) {
    query.createdAt = { $gt: userClearedAt };
  } else if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: cursor.id };
  }

  const messages = await MessageModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('senderId', 'username avatarUrl')
    .lean();

  const hasMore = messages.length > limit;
  const data = messages.slice(0, limit);

  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastMessage = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastMessage.createdAt.toISOString(),
      id: lastMessage._id.toString(),
    });
  }

  return {
    data: data.map((message) =>
      formatMessage(message as unknown as PopulatedMessageDoc),
    ),
    nextCursor,
    hasMore,
  };
};

export const sendMessage = async (
  userId: string,
  conversationId: string,
  text: string,
): Promise<MessageItem> => {
  const conversation = await assertParticipant(userId, conversationId);

  const message = await MessageModel.create({
    conversationId,
    senderId: userId,
    text,
  });

  await ConversationModel.findByIdAndUpdate(conversation._id, {
    $set: { lastMessageAt: new Date() },
  });

  const recipients = conversation.participantIds.filter(
    (participant) => participant._id.toString() !== userId,
  );

  for (const recipient of recipients) {
    await ConversationModel.updateOne(
      { _id: conversation._id },
      { $pull: { hiddenFor: recipient._id } },
    );

    const result = await ConversationModel.updateOne(
      {
        _id: conversation._id,
        'unreadCounts.userId': recipient._id,
      },
      { $inc: { 'unreadCounts.$.count': 1 } },
    );

    if (result.matchedCount === 0) {
      await ConversationModel.updateOne(
        { _id: conversation._id },
        { $push: { unreadCounts: { userId: recipient._id, count: 1 } } },
      );
    }
  }

  const populated = await message.populate('senderId', 'username avatarUrl');

  return formatMessage(populated as unknown as PopulatedMessageDoc);
};

export const getConversationById = async (
  id: string,
): Promise<PopulatedConversationDoc | null> => {
  return ConversationModel.findById(id)
    .populate('participantIds', 'username fullName avatarUrl')
    .lean() as Promise<PopulatedConversationDoc | null>;
};

export const markConversationRead = async (
  userId: string,
  conversationId: string,
): Promise<void> => {
  await assertParticipant(userId, conversationId);

  const userObjectId = new Types.ObjectId(userId);
  const result = await ConversationModel.updateOne(
    { _id: conversationId, 'unreadCounts.userId': userObjectId },
    { $set: { 'unreadCounts.$.count': 0 } },
  );

  if (result.matchedCount === 0) {
    await ConversationModel.updateOne(
      { _id: conversationId },
      { $push: { unreadCounts: { userId: userObjectId, count: 0 } } },
    );
  }
};

export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  const userObjectId = new Types.ObjectId(userId);
  const result = await ConversationModel.aggregate([
    {
      $match: {
        participantIds: userObjectId,
        hiddenFor: { $ne: userObjectId },
      },
    },
    { $unwind: '$unreadCounts' },
    { $match: { 'unreadCounts.userId': userObjectId } },
    { $group: { _id: null, total: { $sum: '$unreadCounts.count' } } },
  ]);

  return result[0]?.total ?? 0;
};

export const deleteConversation = async (
  userId: string,
  conversationId: string,
): Promise<void> => {
  const conversation = await assertParticipant(userId, conversationId);

  const userObjectId = new Types.ObjectId(userId);
  const now = new Date();

  // Set clearedAt for this user (upsert pattern)
  const clearedResult = await ConversationModel.updateOne(
    { _id: conversationId, 'clearedAt.userId': userObjectId },
    { $set: { 'clearedAt.$.date': now } },
  );

  if (clearedResult.matchedCount === 0) {
    await ConversationModel.updateOne(
      { _id: conversationId },
      { $push: { clearedAt: { userId: userObjectId, date: now } } },
    );
  }

  // Hide conversation and reset unread count
  await ConversationModel.updateOne(
    { _id: conversationId },
    {
      $addToSet: { hiddenFor: userObjectId },
      $set: { 'unreadCounts.$[entry].count': 0 },
    },
    { arrayFilters: [{ 'entry.userId': userObjectId }] },
  );

  await ConversationModel.updateOne(
    { _id: conversationId, 'unreadCounts.userId': { $ne: userObjectId } },
    { $push: { unreadCounts: { userId: userObjectId, count: 0 } } },
  );

  // Check if all participants have cleared — if so, fully delete
  const updated = await ConversationModel.findById(conversationId).lean();
  if (updated) {
    const participantCount = updated.participantIds.length;
    const clearedCount = updated.clearedAt?.length ?? 0;

    if (clearedCount >= participantCount) {
      await MessageModel.deleteMany({ conversationId });
      await ConversationModel.findByIdAndDelete(conversationId);
    }
  }
};

/**
 * Broadcast a new message to all conversation participants except the sender.
 */
export const broadcastNewMessage = async (
  io: Server,
  conversationId: string,
  senderId: string,
  message: MessageItem,
): Promise<void> => {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return;

  for (const participant of conversation.participantIds) {
    if (participant._id.toString() !== senderId) {
      io.to(`user:${participant._id.toString()}`).emit('message:new', {
        message,
      });
    }
  }
};
