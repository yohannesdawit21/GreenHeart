import type { TransactionStatus, TransactionType } from '../../shared/types/contracts.js';
import { getPool } from '../../database/postgres/connection.js';

export interface WalletRow {
  user_id: string;
  coin_balance: number;
  escrow_balance: number;
  withdrawable_balance: number;
}

export interface TransactionRow {
  id: string;
  client_id: string;
  advisor_id: string | null;
  type: TransactionType;
  amount_coins: number;
  fiat_amount: string | null;
  currency: string | null;
  status: TransactionStatus;
  gateway_reference: string | null;
  created_at: Date;
}

export async function findWalletByUserId(userId: string): Promise<WalletRow | null> {
  const { rows } = await getPool().query<WalletRow>(
    `SELECT user_id, coin_balance, escrow_balance, withdrawable_balance
     FROM wallets WHERE user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function findTransactionsByClientId(
  clientId: string,
  limit = 50,
): Promise<TransactionRow[]> {
  return findTransactionsForUser(clientId, limit);
}

/** Ledger rows where the user is payer (client_id) or payee (advisor_id). */
export async function findTransactionsForUser(userId: string, limit = 50): Promise<TransactionRow[]> {
  const { rows } = await getPool().query<TransactionRow>(
    `SELECT id, client_id, advisor_id, type, amount_coins, fiat_amount, currency,
            status, gateway_reference, created_at
     FROM transactions
     WHERE client_id = $1 OR advisor_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return rows;
}

export async function findTransactionByGatewayReference(
  gatewayReference: string,
): Promise<TransactionRow | null> {
  const { rows } = await getPool().query<TransactionRow>(
    `SELECT id, client_id, advisor_id, type, amount_coins, fiat_amount, currency,
            status, gateway_reference, created_at
     FROM transactions
     WHERE gateway_reference = $1`,
    [gatewayReference],
  );
  return rows[0] ?? null;
}

export interface PlatformEarningsRow {
  platform_earned_coins: number;
  gross_withdrawn_coins: number;
  withdrawal_count: number;
}

/** Sum platform fees retained on completed advisor withdrawals */
export async function getPlatformEarningsStats(feePercent: number): Promise<PlatformEarningsRow> {
  const { rows } = await getPool().query<PlatformEarningsRow>(
    `SELECT
       COALESCE(SUM(FLOOR(amount_coins * $1 / 100.0)), 0)::int AS platform_earned_coins,
       COALESCE(SUM(amount_coins), 0)::int AS gross_withdrawn_coins,
       COUNT(*)::int AS withdrawal_count
     FROM transactions
     WHERE type = 'withdrawal' AND status = 'completed'`,
    [feePercent],
  );
  return (
    rows[0] ?? {
      platform_earned_coins: 0,
      gross_withdrawn_coins: 0,
      withdrawal_count: 0,
    }
  );
}

export async function createPendingDeposit(input: {
  clientId: string;
  amountCoins: number;
  fiatAmount: number;
  currency: string;
  gatewayReference: string;
}): Promise<TransactionRow> {
  const { rows } = await getPool().query<TransactionRow>(
    `INSERT INTO transactions (client_id, type, amount_coins, fiat_amount, currency, status, gateway_reference)
     VALUES ($1, 'deposit', $2, $3, $4, 'pending', $5)
     RETURNING id, client_id, advisor_id, type, amount_coins, fiat_amount, currency,
               status, gateway_reference, created_at`,
    [input.clientId, input.amountCoins, input.fiatAmount, input.currency, input.gatewayReference],
  );
  return rows[0];
}
