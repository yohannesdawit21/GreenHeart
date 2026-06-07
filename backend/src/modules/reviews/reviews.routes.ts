import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors/AppError.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../shared/middleware/validateBody.js';
import { getAdvisorReviews, getMyReviews, postReview } from './reviews.controller.js';

const router = Router();

const submitReviewSchema = z.object({
  sessionId: z.string().min(8).max(64),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

const advisorIdSchema = z.object({
  advisorId: z.string().uuid(),
});

router.post('/', requireAuth, requireRole('client'), validateBody(submitReviewSchema), postReview);

router.get('/me', requireAuth, requireRole('client'), getMyReviews);

router.get('/advisor/:advisorId', (req, res, next) => {
  const parsed = advisorIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid advisor id'));
  }
  req.params.advisorId = parsed.data.advisorId;
  return getAdvisorReviews(req, res, next);
});

export const reviewsRouter = router;
