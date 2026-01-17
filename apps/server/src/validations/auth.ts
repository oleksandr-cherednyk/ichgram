import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z.string().trim().min(3).max(30),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const refreshSchema = z.object({});
