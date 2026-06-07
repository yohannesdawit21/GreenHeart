import type { TransactionDto, WalletBalance } from '../../shared/types/contracts.js';
import type { TransactionRow, WalletRow } from './wallet.repository.js';

export function toWalletBalance(row: WalletRow): WalletBalance {
  return {
    coinBalance: row.coin_balance,
    escrowBalance: row.escrow_balance,
    withdrawableBalance: row.withdrawable_balance,
  };
}

function signedAmountForUser(row: TransactionRow, userId: string): number {
  const amount = row.amount_coins;
  switch (row.type) {
    case 'deposit':
      return amount;
    case 'escrow_lock':
      return -amount;
    case 'escrow_refund':
      return amount;
    case 'escrow_release':
      return row.advisor_id === userId ? amount : -amount;
    case 'withdrawal':
      return -amount;
    default:
      return amount;
  }
}

export function toTransactionDto(row: TransactionRow, viewerUserId?: string): TransactionDto {
  return {
    id: row.id,
    type: row.type,
    amountCoins: viewerUserId ? signedAmountForUser(row, viewerUserId) : row.amount_coins,
    fiatAmount: row.fiat_amount ? Number(row.fiat_amount) : undefined,
    currency: row.currency ?? undefined,
    status: row.status,
    timestamp: row.created_at.toISOString(),
    advisorId: row.advisor_id ?? undefined,
  };
}
