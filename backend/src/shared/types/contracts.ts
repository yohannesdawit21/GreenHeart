/** Mirrors shared/contracts — kept in src/ for tsc rootDir compatibility */

export type UserRole = 'client' | 'advisor';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    username: string;
    bio: string;
    tags: string[];
    coinRatePerSession: number;
  };
}

export interface AdvisorCardDto {
  id: string;
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
  rating?: number;
  reviewCount?: number;
  isOnline?: boolean;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  tags?: string[];
  coinRatePerSession?: number;
}

export type TransactionType = 'deposit' | 'escrow_lock' | 'escrow_release' | 'escrow_refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type CoinPackageId = 'starter' | 'growth' | 'pro';

export interface WalletBalance {
  coinBalance: number;
  escrowBalance: number;
  withdrawableBalance: number;
}

export interface TransactionDto {
  id: string;
  type: TransactionType;
  amountCoins: number;
  fiatAmount?: number;
  currency?: string;
  status: TransactionStatus;
  timestamp: string;
  advisorId?: string;
}
