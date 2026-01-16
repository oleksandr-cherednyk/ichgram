import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Post document with author, media, and computed counters.
const postSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, default: '', trim: true },
    imageUrl: { type: String, required: true },
    hashtags: { type: [String], default: [] },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

export type Post = InferSchemaType<typeof postSchema>;

export const PostModel = models.Post || model<Post>('Post', postSchema);
