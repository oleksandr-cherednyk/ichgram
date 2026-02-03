import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Comment entity tied to a post and author.
const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

commentSchema.index({ postId: 1, createdAt: -1 });

export type Comment = InferSchemaType<typeof commentSchema>;

export const CommentModel =
  models.Comment || model<Comment>('Comment', commentSchema);
