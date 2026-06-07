import { z } from 'zod';

const advisorLanguageSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(80),
  fluency: z.enum(['native', 'fluent', 'conversational', 'basic']),
});

const advisorCredentialsSchema = z.object({
  issuingRegion: z.string().min(1).max(80),
  issuingRegionOther: z.string().max(120).optional(),
  professionType: z.string().min(1).max(80),
  credentialType: z.string().min(1).max(120),
  credentialTypeOther: z.string().max(120).optional(),
  issuingBody: z.string().min(1).max(120),
  issuingBodyOther: z.string().max(120).optional(),
  licenseNumber: z.string().min(1).max(80),
  degree: z.string().max(120).optional(),
  yearsExperience: z.number().int().min(0).max(60),
  languages: z.array(advisorLanguageSchema).min(1).max(15),
  professionalTitle: z.string().min(2).max(120),
  specialtyCategory: z.string().max(80).optional(),
  additionalCertifications: z.string().max(300).optional(),
});

const clientProfileSchema = z.object({
  username: z.string().min(2).max(100),
  bio: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  coinRatePerSession: z.number().int().min(0).optional(),
});

const advisorProfileSchema = z.object({
  username: z.string().min(2).max(100),
  bio: z.string().max(4000).optional(),
  tags: z.array(z.string().max(50)).min(1).max(20),
  coinRatePerSession: z.number().int().min(20).max(500).optional(),
  credentials: advisorCredentialsSchema,
});

/** Patient self-registration — clients only */
export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  profile: clientProfileSchema.optional(),
});

/** Doctor applicant registration — separate path (M6) */
export const registerAdvisorSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  profile: advisorProfileSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterAdvisorInput = z.infer<typeof registerAdvisorSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export { advisorCredentialsSchema, advisorLanguageSchema };
