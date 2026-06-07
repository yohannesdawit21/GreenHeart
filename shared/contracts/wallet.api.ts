/**
 * Wallet API contracts — Owner: Role B
 */

export type TransactionType = 'deposit' | 'escrow_lock' | 'escrow_release' | 'escrow_refund' | 'withdrawal';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface WalletBalance {
  coinBalance: number;
  escrowBalance: number;
  withdrawableBalance: number;
}

export interface WalletBalanceResponse {
  wallet: WalletBalance;
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

export interface TransactionListResponse {
  transactions: TransactionDto[];
}

export type CoinPackageId = 'starter' | 'growth' | 'pro';

export interface PurchaseInitiateRequest {
  packageId: CoinPackageId;
}

export interface PurchaseInitiateResponse {
  checkoutUrl?: string;
  mockPaymentId?: string;
  coins: number;
  amountUsd: number;
}

/** Dev sandbox — complete mock checkout after purchase/initiate */
export interface CompleteMockPurchaseRequest {
  mockPaymentId: string;
}

export interface CompleteMockPurchaseResponse {
  alreadyProcessed: boolean;
  transaction: TransactionDto;
}

/** Internal — M5 calls via service, not public REST */
export interface EscrowLockRequest {
  clientId: string;
  amountCoins: number;
  sessionId: string;
}

export interface EscrowLockResponse {
  success: boolean;
  error?: 'INSUFFICIENT_FUNDS';
}

/** Advisor demo payout — withdraw settled session earnings */
export interface WithdrawRequest {
  amountCoins: number;
}

export interface WithdrawResponse {
  transaction: TransactionDto;
  wallet: WalletBalance;
  grossCoins: number;
  platformFeeCoins: number;
  netPayoutCoins: number;
  feePercent: number;
}

export interface WithdrawFeeRateResponse {
  feePercent: number;
}
