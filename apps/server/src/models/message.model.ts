import { Schema, model, models, type InferSchemaType } from 'mongoose';

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export type Message = InferSchemaType<typeof messageSchema>;

export const MessageModel =
  models.Message || model<Message>('Message', messageSchema);
