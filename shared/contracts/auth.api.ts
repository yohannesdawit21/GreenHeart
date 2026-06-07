/**
 * Auth API contracts — Owner: Role B
 * @see agent/api-contracts.md
 */

import type { AdvisorCredentials } from './models.advisor.js';

export type UserRole = 'client' | 'advisor' | 'partner_doctor' | 'admin';

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected' | 'suspended';

export interface RegisterRequest {
  email: string;
  password: string;
  /** Client path only — use RegisterAdvisorRequest for doctor applicants */
  role?: 'client';
  profile?: {
    username: string;
    bio?: string;
    tags?: string[];
    coinRatePerSession?: number;
  };
}

export interface RegisterAdvisorRequest {
  email: string;
  password: string;
  profile: {
    username: string;
    bio?: string;
    tags?: string[];
    coinRatePerSession?: number;
    credentials?: AdvisorCredentials;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    username: string;
    bio: string;
    tags: string[];
    coinRatePerSession: number;
    /** Present for advisor role — M6 */
    verificationStatus?: VerificationStatus;
    /** Structured credentials from apply wizard */
    credentials?: AdvisorCredentials;
  };
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
}

export interface MeResponse {
  user: AuthUser;
  token?: string;
}
