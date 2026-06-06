import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../shared/errors/AppError.js';
import { requireAuth } from '../shared/middleware/auth.middleware.js';
import { getVerificationLiveKitToken } from './verification.controller.js';

const router = Router();

const interviewIdSchema = z.object({
  id: z.string().uuid(),
});

router.get('/:id/livekit-token', requireAuth, (req, res, next) => {
  const parsed = interviewIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid interview id'));
  }
  req.params.id = parsed.data.id;
  return getVerificationLiveKitToken(req, res, next);
});

export const verificationLiveKitRouter = router;
