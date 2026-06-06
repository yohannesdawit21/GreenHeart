import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../shared/middleware/validateBody.js';
import * as walletController from './wallet.controller.js';

const purchaseSchema = z.object({
  packageId: z.enum(['starter', 'growth', 'pro']),
});

const escrowLockSchema = z.object({
  clientId: z.string().uuid(),
  amountCoins: z.number().int().positive(),
  sessionId: z.string().optional(),
});

const escrowReleaseSchema = z.object({
  clientId: z.string().uuid(),
  advisorId: z.string().uuid(),
  amountCoins: z.number().int().positive(),
});

const escrowRefundSchema = z.object({
  clientId: z.string().uuid(),
  amountCoins: z.number().int().positive(),
});

const router = Router();

router.get('/balance', requireAuth, walletController.getBalance);
router.get('/transactions', requireAuth, walletController.getTransactions);
router.post('/purchase/initiate', requireAuth, validateBody(purchaseSchema), walletController.initiatePurchase);
router.post('/webhook/payment', walletController.paymentWebhook);

// Internal escrow endpoints — M5 may call service directly or via HTTP
router.post('/escrow/lock', requireAuth, validateBody(escrowLockSchema), walletController.lockEscrow);
router.post('/escrow/release', requireAuth, validateBody(escrowReleaseSchema), walletController.releaseEscrow);
router.post('/escrow/refund', requireAuth, validateBody(escrowRefundSchema), walletController.refundEscrow);

export const walletRouter = router;
