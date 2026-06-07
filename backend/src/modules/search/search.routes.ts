import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors/AppError.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware.js';
import { postReindexAdvisor, postSemanticSearch } from './search.controller.js';

const router = Router();

const semanticSearchSchema = z.object({
  query: z.string().min(1).max(2000),
  limit: z.number().int().min(1).max(25).optional(),
});

const advisorIdSchema = z.object({
  advisorId: z.string().uuid(),
});

router.post('/semantic', async (req, res, next) => {
  const parsed = semanticSearchSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', parsed.error.errors[0]?.message ?? 'Invalid request'));
  }
  req.body = parsed.data;
  return postSemanticSearch(req, res, next);
});

router.post('/reindex/:advisorId', requireAuth, requireRole('admin'), async (req, res, next) => {
  const parsed = advisorIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid advisor id'));
  }
  req.params.advisorId = parsed.data.advisorId;
  return postReindexAdvisor(req, res, next);
});

export const searchRouter = router;
