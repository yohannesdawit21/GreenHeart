import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors/AppError.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../shared/middleware/validateBody.js';
import { getAdvisorPresenceStatus, getOnlineAdvisors, updatePresenceStatus } from './presence.service.js';

const router = Router();

const statusSchema = z.object({
  online: z.boolean(),
});

router.patch('/status', requireAuth, validateBody(statusSchema), async (req, res, next) => {
  try {
    const { online } = req.body as z.infer<typeof statusSchema>;
    const result = await updatePresenceStatus(req.auth!, online);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await getAdvisorPresenceStatus(req.auth!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/advisors', async (_req, res, next) => {
  try {
    const result = await getOnlineAdvisors();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export const presenceRouter = router;
