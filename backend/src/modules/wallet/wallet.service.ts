import { randomUUID } from 'node:crypto';
import type { CoinPackageId } from '../../shared/types/contracts.js';
import { calculateWithdrawalSplit } from '../../shared/wallet/withdrawalFee.js';
import { coinPackages, config } from '../../config/index.js';
import { getPool } from '../../database/postgres/connection.js';
import { AppError } from '../../shared/errors/AppError.js';
import { toTransactionDto, toWalletBalance } from './wallet.mapper.js';
import * as walletRepo from './wallet.repository.js';

export async function getBalance(userId: string) {
  const wallet = await walletRepo.findWalletByUserId(userId);
  if (!wallet) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Wallet not found');
  }
  return toWalletBalance(wallet);
}

export async function getTransactions(userId: string) {
  const rows = await walletRepo.findTransactionsForUser(userId);
  return rows.map((row) => toTransactionDto(row, userId));
}

export async function initiatePurchase(userId: string, packageId: CoinPackageId) {
  const pkg = coinPackages[packageId];
  if (!pkg) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid coin package');
  }

  const mockPaymentId = `mock_${randomUUID()}`;
  await walletRepo.createPendingDeposit({
    clientId: userId,
    amountCoins: pkg.coins,
    fiatAmount: pkg.priceUsd,
    currency: 'USD',
    gatewayReference: mockPaymentId,
  });

  return {
    mockPaymentId,
    coins: pkg.coins,
    amountUsd: pkg.priceUsd,
    checkoutUrl: `${config.corsOrigin}/wallet?payment=${mockPaymentId}`,
  };
}

/** Atomic escrow lock — exported for M5 session orchestration */
export async function lockEscrow(clientId: string, amount: number, _sessionId?: string): Promise<boolean> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const update = await client.query(
      `UPDATE wallets SET coin_balance = coin_balance - $1, escrow_balance = escrow_balance + $1
       WHERE user_id = $2 AND coin_balance >= $1 RETURNING user_id`,
      [amount, clientId],
    );
    if (update.rowCount === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    await client.query(
      `INSERT INTO transactions (client_id, type, amount_coins, status)
       VALUES ($1, 'escrow_lock', $2, 'completed')`,
      [clientId, amount],
    );
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function releaseEscrow(
  clientId: string,
  advisorId: string,
  amount: number,
): Promise<void> {
  const db = await getPool().connect();
  try {
    await db.query('BEGIN');
    const clientUpdate = await db.query(
      `UPDATE wallets SET escrow_balance = escrow_balance - $1
       WHERE user_id = $2 AND escrow_balance >= $1 RETURNING user_id`,
      [amount, clientId],
    );
    if (clientUpdate.rowCount === 0) {
      await db.query('ROLLBACK');
      throw new AppError(400, 'INSUFFICIENT_FUNDS', 'Insufficient escrow balance');
    }
    await db.query(
      `UPDATE wallets SET withdrawable_balance = withdrawable_balance + $1
       WHERE user_id = $2`,
      [amount, advisorId],
    );
    await db.query(
      `INSERT INTO transactions (client_id, advisor_id, type, amount_coins, status)
       VALUES ($1, $2, 'escrow_release', $3, 'completed')`,
      [clientId, advisorId, amount],
    );
    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  } finally {
    db.release();
  }
}

export async function refundEscrow(clientId: string, amount: number): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const update = await client.query(
      `UPDATE wallets SET escrow_balance = escrow_balance - $1, coin_balance = coin_balance + $1
       WHERE user_id = $2 AND escrow_balance >= $1 RETURNING user_id`,
      [amount, clientId],
    );
    if (update.rowCount === 0) {
      await client.query('ROLLBACK');
      throw new AppError(400, 'INSUFFICIENT_FUNDS', 'Insufficient escrow balance');
    }
    await client.query(
      `INSERT INTO transactions (client_id, type, amount_coins, status)
       VALUES ($1, 'escrow_refund', $2, 'completed')`,
      [clientId, amount],
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function processPaymentWebhook(input: {
  gatewayReference: string;
  status: 'completed' | 'failed';
}) {
  const existing = await walletRepo.findTransactionByGatewayReference(input.gatewayReference);
  if (!existing) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Payment not found');
  }
  if (existing.status === 'completed') {
    return { alreadyProcessed: true, transaction: toTransactionDto(existing) };
  }

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    if (input.status === 'completed') {
      await client.query(
        `UPDATE wallets SET coin_balance = coin_balance + $1 WHERE user_id = $2`,
        [existing.amount_coins, existing.client_id],
      );
      await client.query(
        `UPDATE transactions SET status = 'completed' WHERE gateway_reference = $1`,
        [input.gatewayReference],
      );
    } else {
      await client.query(
        `UPDATE transactions SET status = 'failed' WHERE gateway_reference = $1`,
        [input.gatewayReference],
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  const updated = await walletRepo.findTransactionByGatewayReference(input.gatewayReference);
  return { alreadyProcessed: false, transaction: toTransactionDto(updated!) };
}

/** Advisor demo payout — debit withdrawable_balance, retain platform service fee */
export async function withdrawEarnings(advisorId: string, amountCoins: number) {
  if (!Number.isInteger(amountCoins) || amountCoins <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Withdrawal amount must be a positive whole number of coins');
  }

  const feePercent = config.platformWithdrawalFeePercent;
  const split = calculateWithdrawalSplit(amountCoins, feePercent);
  if (split.netPayoutCoins <= 0) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      `Amount too small after ${feePercent}% platform fee — try withdrawing more coins`,
    );
  }

  const db = await getPool().connect();
  try {
    await db.query('BEGIN');
    const update = await db.query(
      `UPDATE wallets SET withdrawable_balance = withdrawable_balance - $1
       WHERE user_id = $2 AND withdrawable_balance >= $1
       RETURNING user_id, coin_balance, escrow_balance, withdrawable_balance`,
      [split.grossCoins, advisorId],
    );
    if (update.rowCount === 0) {
      await db.query('ROLLBACK');
      throw new AppError(402, 'INSUFFICIENT_FUNDS', 'Insufficient withdrawable balance');
    }

    const payoutRef = `payout_${randomUUID()}`;
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO transactions (client_id, type, amount_coins, status, gateway_reference)
       VALUES ($1, 'withdrawal', $2, 'completed', $3)
       RETURNING id`,
      [advisorId, split.grossCoins, payoutRef],
    );

    await db.query('COMMIT');

    const walletRow = update.rows[0] as {
      coin_balance: number;
      escrow_balance: number;
      withdrawable_balance: number;
    };

    return {
      grossCoins: split.grossCoins,
      platformFeeCoins: split.platformFeeCoins,
      netPayoutCoins: split.netPayoutCoins,
      feePercent: split.feePercent,
      transaction: toTransactionDto(
        {
          id: rows[0]!.id,
          client_id: advisorId,
          advisor_id: null,
          type: 'withdrawal',
          amount_coins: split.grossCoins,
          fiat_amount: null,
          currency: null,
          status: 'completed',
          gateway_reference: payoutRef,
          created_at: new Date(),
        },
        advisorId,
      ),
      wallet: toWalletBalance({
        user_id: advisorId,
        coin_balance: walletRow.coin_balance,
        escrow_balance: walletRow.escrow_balance,
        withdrawable_balance: walletRow.withdrawable_balance,
      }),
    };
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  } finally {
    db.release();
  }
}

export function getWithdrawalFeeRate() {
  return { feePercent: config.platformWithdrawalFeePercent };
}

/** Dev sandbox — client completes mock checkout from frontend */
export async function completeMockPurchase(userId: string, mockPaymentId: string) {
  const existing = await walletRepo.findTransactionByGatewayReference(mockPaymentId);
  if (!existing) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Payment not found');
  }
  if (existing.client_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your payment');
  }
  return processPaymentWebhook({ gatewayReference: mockPaymentId, status: 'completed' });
}
