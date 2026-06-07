import type { Request, Response } from 'express';
import { config } from '../../config/index.js';
import { AppError } from '../../shared/errors/AppError.js';
import * as walletService from './wallet.service.js';

export async function getBalance(req: Request, res: Response) {
  const wallet = await walletService.getBalance(req.auth!.userId);
  res.json({ wallet });
}

export async function getTransactions(req: Request, res: Response) {
  const transactions = await walletService.getTransactions(req.auth!.userId);
  res.json({ transactions });
}

export async function initiatePurchase(req: Request, res: Response) {
  const result = await walletService.initiatePurchase(req.auth!.userId, req.body.packageId);
  res.json(result);
}

export async function completeMockPurchase(req: Request, res: Response) {
  const { mockPaymentId } = req.body as { mockPaymentId: string };
  const result = await walletService.completeMockPurchase(req.auth!.userId, mockPaymentId);
  res.json(result);
}

export async function withdrawEarnings(req: Request, res: Response) {
  const { amountCoins } = req.body as { amountCoins: number };
  const result = await walletService.withdrawEarnings(req.auth!.userId, amountCoins);
  res.json(result);
}

export async function getWithdrawalFeeRate(_req: Request, res: Response) {
  res.json(walletService.getWithdrawalFeeRate());
}

export async function lockEscrow(req: Request, res: Response) {
  const { clientId, amountCoins } = req.body;
  const success = await walletService.lockEscrow(clientId, amountCoins, req.body.sessionId);
  if (!success) {
    return res.status(400).json({ success: false, error: 'INSUFFICIENT_FUNDS' });
  }
  res.json({ success: true });
}

export async function releaseEscrow(req: Request, res: Response) {
  const { clientId, advisorId, amountCoins } = req.body;
  await walletService.releaseEscrow(clientId, advisorId, amountCoins);
  res.json({ success: true });
}

export async function refundEscrow(req: Request, res: Response) {
  const { clientId, amountCoins } = req.body;
  await walletService.refundEscrow(clientId, amountCoins);
  res.json({ success: true });
}

export async function paymentWebhook(req: Request, res: Response) {
  const secret = config.payment.webhookSecret;
  if (secret) {
    const headerSecret = req.headers['x-webhook-secret'];
    if (headerSecret !== secret) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid webhook signature');
    }
  }

  const { gatewayReference, status } = req.body as {
    gatewayReference?: string;
    status?: 'completed' | 'failed';
  };

  if (!gatewayReference || !status) {
    throw new AppError(400, 'VALIDATION_ERROR', 'gatewayReference and status are required');
  }

  const result = await walletService.processPaymentWebhook({ gatewayReference, status });
  res.json(result);
}
