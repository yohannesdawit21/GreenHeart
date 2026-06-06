import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../shared/middleware/validateBody.js';
import * as verificationController from './verification.controller.js';

const startInterviewSchema = z.object({
  applicantId: z.string().uuid(),
});

const completeInterviewSchema = z.object({
  outcome: z.enum(['pass', 'fail']),
  notes: z.string().max(2000).optional(),
});

const router = Router();

router.use(requireAuth);

router.get('/applicants', requireRole('partner_doctor'), verificationController.listApplicants);
router.get('/my-interview', requireRole('advisor'), verificationController.getMyInterview);
router.post(
  '/interviews',
  requireRole('partner_doctor'),
  validateBody(startInterviewSchema),
  verificationController.startInterview,
);
router.patch(
  '/interviews/:id/complete',
  requireRole('partner_doctor'),
  validateBody(completeInterviewSchema),
  verificationController.completeInterview,
);

// LiveKit token: Role C — livekit/verification.routes.ts at /api/verification/interviews/:id/livekit-token

export const verificationRouter = router;
