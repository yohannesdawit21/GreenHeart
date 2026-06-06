import { Router } from 'express';

/** Role C — implement in M5 */
const router = Router();

router.post('/initiate', (_req, res) => {
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Session initiate — implement M5' },
  });
});

export const sessionsRouter = router;
