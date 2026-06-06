import { Router } from 'express';

/** Role B — implement in M2 */
const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'auth', status: 'stub' });
});

// TODO M2: POST /register, /login, /logout, GET /me

export const authRouter = router;
