import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().min(2).max(100),
  bio: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  coinRatePerSession: z.number().int().min(0).optional(),
});

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(['client', 'advisor']),
  profile: profileSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
