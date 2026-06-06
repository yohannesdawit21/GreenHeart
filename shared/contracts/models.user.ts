/**
 * Shared domain models — see agent/data-models.md (PostgreSQL)
 */

export type UserRole = 'client' | 'advisor' | 'partner_doctor' | 'admin';

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected' | 'suspended';

export interface UserProfile {
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
  /** Advisors only — M6 */
  verificationStatus?: VerificationStatus;
}

export interface UserWallet {
  coinBalance: number;
  escrowBalance: number;
  withdrawableBalance: number;
}

export interface UserDocument {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  profile: UserProfile;
  wallet: UserWallet;
}
