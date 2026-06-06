import { Router } from 'express';

/** Role B — implement in M2 */
const router = Router();

router.get('/advisors', (_req, res) => {
  res.json({ advisors: [], _note: 'stub — implement M2' });
});

export const usersRouter = router;
