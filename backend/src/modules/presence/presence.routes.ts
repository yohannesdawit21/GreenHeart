import { Router } from 'express';

/** Role C — implement in M5 */
const router = Router();

router.patch('/status', (_req, res) => {
  res.json({ advisorId: '', online: false, _note: 'stub — implement M5' });
});

export const presenceRouter = router;
