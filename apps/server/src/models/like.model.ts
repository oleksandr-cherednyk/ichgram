import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Like relation between user and post.
const likeSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export type Like = InferSchemaType<typeof likeSchema>;

export const LikeModel = models.Like || model<Like>('Like', likeSchema);
