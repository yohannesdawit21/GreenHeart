import { randomUUID } from 'node:crypto';
import type { CoinPackageId } from '../../shared/types/contracts.js';
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
  const rows = await walletRepo.findTransactionsByClientId(userId);
  return rows.map(toTransactionDto);
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
