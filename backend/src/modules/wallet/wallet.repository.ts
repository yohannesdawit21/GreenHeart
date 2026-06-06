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
  const { rows } = await getPool().query<TransactionRow>(
    `SELECT id, client_id, advisor_id, type, amount_coins, fiat_amount, currency,
            status, gateway_reference, created_at
     FROM transactions
     WHERE client_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [clientId, limit],
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
