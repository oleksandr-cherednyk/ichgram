import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Follow relation between two users.
const followSchema = new Schema(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export type Follow = InferSchemaType<typeof followSchema>;

export const FollowModel =
  models.Follow || model<Follow>('Follow', followSchema);
