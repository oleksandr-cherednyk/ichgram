import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Like relation between user and comment.
const commentLikeSchema = new Schema(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export type CommentLike = InferSchemaType<typeof commentLikeSchema>;

export const CommentLikeModel =
  models.CommentLike || model<CommentLike>('CommentLike', commentLikeSchema);
