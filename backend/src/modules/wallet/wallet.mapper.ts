import type { TransactionDto, WalletBalance } from '../../shared/types/contracts.js';
import type { TransactionRow, WalletRow } from './wallet.repository.js';

export function toWalletBalance(row: WalletRow): WalletBalance {
  return {
    coinBalance: row.coin_balance,
    escrowBalance: row.escrow_balance,
    withdrawableBalance: row.withdrawable_balance,
  };
}

export function toTransactionDto(row: TransactionRow): TransactionDto {
  return {
    id: row.id,
    type: row.type,
    amountCoins: row.amount_coins,
    fiatAmount: row.fiat_amount ? Number(row.fiat_amount) : undefined,
    currency: row.currency ?? undefined,
    status: row.status,
    timestamp: row.created_at.toISOString(),
    advisorId: row.advisor_id ?? undefined,
  };
}
