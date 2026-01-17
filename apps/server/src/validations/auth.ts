import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().trim().min(2).max(80),
  username: z.string().trim().min(3).max(30),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const refreshSchema = z.object({}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
