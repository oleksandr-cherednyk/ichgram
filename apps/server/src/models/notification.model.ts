import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Notification for user-facing events (likes, comments, follows).
const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow'],
      required: true,
    },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export type Notification = InferSchemaType<typeof notificationSchema>;

export const NotificationModel =
  models.Notification ||
  model<Notification>('Notification', notificationSchema);
