import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import {
  CommentModel,
  ConversationModel,
  FollowModel,
  LikeModel,
  MessageModel,
  PostModel,
  UserModel,
} from '../../models';

const DEFAULT_PASSWORD = 'password123';

let counter = 0;
const uid = () => ++counter;

export const createUser = async (
  overrides: Partial<{
    email: string;
    username: string;
    fullName: string;
    password: string;
  }> = {},
) => {
  const id = uid();
  const passwordHash = await bcrypt.hash(
    overrides.password ?? DEFAULT_PASSWORD,
    10,
  );
  return UserModel.create({
    email: overrides.email ?? `user${id}@test.com`,
    username: overrides.username ?? `user${id}`,
    fullName: overrides.fullName ?? `Test User ${id}`,
    passwordHash,
  });
};

export const createPost = async (
  authorId: mongoose.Types.ObjectId,
  overrides: Partial<{
    caption: string;
    imageUrl: string;
    hashtags: string[];
  }> = {},
) => {
  return PostModel.create({
    authorId,
    caption: overrides.caption ?? 'Test caption',
    imageUrl: overrides.imageUrl ?? '/uploads/posts/test.jpg',
    hashtags: overrides.hashtags ?? [],
  });
};

export const createComment = async (
  postId: mongoose.Types.ObjectId,
  authorId: mongoose.Types.ObjectId,
  text = 'Test comment',
) => {
  return CommentModel.create({ postId, authorId, text });
};

export const createFollow = async (
  followerId: mongoose.Types.ObjectId,
  followingId: mongoose.Types.ObjectId,
) => {
  return FollowModel.create({ followerId, followingId });
};

export const createConversation = async (
  participantIds: mongoose.Types.ObjectId[],
) => {
  return ConversationModel.create({
    participantIds,
    lastMessageAt: new Date(),
  });
};

export const createMessage = async (
  conversationId: mongoose.Types.ObjectId,
  senderId: mongoose.Types.ObjectId,
  text = 'Test message',
) => {
  return MessageModel.create({ conversationId, senderId, text });
};

export const cleanAll = async () => {
  await Promise.all([
    UserModel.deleteMany({}),
    PostModel.deleteMany({}),
    CommentModel.deleteMany({}),
    LikeModel.deleteMany({}),
    FollowModel.deleteMany({}),
    ConversationModel.deleteMany({}),
    MessageModel.deleteMany({}),
  ]);
  counter = 0;
};
