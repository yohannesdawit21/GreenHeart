/**
 * Shared domain models — see agent/data-models.md (PostgreSQL)
 */

export type UserRole = 'client' | 'advisor';

export interface UserProfile {
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
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
