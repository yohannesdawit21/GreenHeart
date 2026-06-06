/** Mirrors shared/contracts — kept in src/ for tsc rootDir compatibility */

export type UserRole = 'client' | 'advisor' | 'partner_doctor' | 'admin';

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected' | 'suspended';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    username: string;
    bio: string;
    tags: string[];
    coinRatePerSession: number;
    verificationStatus?: VerificationStatus;
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

export type InterviewOutcome = 'pass' | 'fail';

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

export interface ApplicantDto {
  id: string;
  email: string;
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface PartnerDoctorDto {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
