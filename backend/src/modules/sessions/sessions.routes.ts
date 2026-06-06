import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors/AppError.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../shared/middleware/validateBody.js';
import {
  getLiveKitToken,
  getSessionStatusHandler,
  postAccept,
  postDecline,
  postEnd,
  postInitiate,
} from './sessions.controller.js';

const router = Router();

const initiateSchema = z.object({
  advisorId: z.string().uuid(),
});

const sessionIdSchema = z.object({
  id: z.string().min(8).max(64),
});

router.post('/initiate', requireAuth, validateBody(initiateSchema), postInitiate);

router.get('/:id/status', requireAuth, (req, res, next) => {
  const parsed = sessionIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid session id'));
  }
  return getSessionStatusHandler(req, res, next);
});

router.post('/:id/accept', requireAuth, (req, res, next) => {
  const parsed = sessionIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid session id'));
  }
  return postAccept(req, res, next);
});

router.post('/:id/decline', requireAuth, (req, res, next) => {
  const parsed = sessionIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid session id'));
  }
  return postDecline(req, res, next);
});

router.post('/:id/end', requireAuth, (req, res, next) => {
  const parsed = sessionIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid session id'));
  }
  return postEnd(req, res, next);
});

router.get('/:id/livekit-token', requireAuth, (req, res, next) => {
  const parsed = sessionIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid session id'));
  }
  return getLiveKitToken(req, res, next);
});

export const sessionsRouter = router;
