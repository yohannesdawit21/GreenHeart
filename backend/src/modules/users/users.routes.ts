import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../shared/middleware/validateBody.js';
import * as usersController from './users.controller.js';

const updateProfileSchema = z.object({
  username: z.string().min(2).max(100).optional(),
  bio: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  coinRatePerSession: z.number().int().min(0).optional(),
});

const router = Router();

router.patch('/me/profile', requireAuth, validateBody(updateProfileSchema), usersController.updateMyProfile);
router.get('/advisors', usersController.listAdvisors);
router.get('/advisors/:id', usersController.getAdvisor);

export const usersRouter = router;
