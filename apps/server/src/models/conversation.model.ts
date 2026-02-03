import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Conversation between two or more participants.
const conversationSchema = new Schema(
  {
    participantIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    unreadCounts: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        count: { type: Number, required: true, default: 0, min: 0 },
      },
    ],
    hiddenFor: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    clearedAt: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
      },
    ],
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
);

conversationSchema.index({ participantIds: 1 });
conversationSchema.index({ participantIds: 1, lastMessageAt: -1 });

export type Conversation = InferSchemaType<typeof conversationSchema>;

export const ConversationModel =
  models.Conversation ||
  model<Conversation>('Conversation', conversationSchema);
