import { Router } from 'express';

/** Role C — implement in M4 */
const router = Router();

router.post('/semantic', (_req, res) => {
  res.json({ results: [], query: '', _note: 'stub — implement M4' });
});

export const searchRouter = router;
