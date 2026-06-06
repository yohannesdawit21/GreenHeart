import { Router } from 'express';

/** Role B — implement in M3 */
const router = Router();

router.get('/balance', (_req, res) => {
  res.json({
    wallet: { coinBalance: 0, escrowBalance: 0, withdrawableBalance: 0 },
    _note: 'stub — implement M3',
  });
});

export const walletRouter = router;
