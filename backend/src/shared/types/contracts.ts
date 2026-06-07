/** Mirrors shared/contracts — kept in src/ for tsc rootDir compatibility */

export type UserRole = 'client' | 'advisor' | 'partner_doctor' | 'admin';

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected' | 'suspended';

export interface AdvisorCredentials {
  professionType: string;
  credentialType: string;
  issuingBody: string;
  issuingRegion: string;
  licenseNumber: string;
  degree?: string;
  yearsExperience: number;
  languages: string[];
  professionalTitle: string;
  specialtyCategory?: string;
  additionalCertifications?: string;
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
    verificationStatus?: VerificationStatus;
    credentials?: AdvisorCredentials;
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
  credentials?: AdvisorCredentials;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  tags?: string[];
  coinRatePerSession?: number;
  credentials?: AdvisorCredentials;
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
  credentials?: AdvisorCredentials;
}

export interface PartnerDoctorDto {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
