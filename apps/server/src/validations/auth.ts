import { z } from 'zod';

const RESERVED_USERNAMES = new Set(['me', 'search', 'admin', 'api', 'explore']);

export const registerSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(
      /^[a-z0-9._]+$/,
      'Username can only contain lowercase letters, numbers, dots and underscores',
    )
    .refine(
      (val) => !RESERVED_USERNAMES.has(val),
      'This username is not available',
    ),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
