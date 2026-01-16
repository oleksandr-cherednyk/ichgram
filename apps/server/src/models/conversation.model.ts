import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Conversation between two or more participants.
const conversationSchema = new Schema(
  {
    participantIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
);

conversationSchema.index({ participantIds: 1 });

export type Conversation = InferSchemaType<typeof conversationSchema>;

export const ConversationModel =
  models.Conversation ||
  model<Conversation>('Conversation', conversationSchema);
