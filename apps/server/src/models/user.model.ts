import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Core user profile and auth-related fields.
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 160 },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model<User>('User', userSchema);
