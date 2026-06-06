import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../shared/middleware/validateBody.js';
import * as adminController from './admin.controller.js';

const partnerDoctorSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  username: z.string().min(2).max(100),
});

const overrideStatusSchema = z.object({
  status: z.enum(['pending_review', 'verified', 'rejected', 'suspended']),
});

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.post('/partner-doctors', validateBody(partnerDoctorSchema), adminController.registerPartnerDoctor);
router.get('/partner-doctors', adminController.listPartnerDoctors);
router.get('/advisors', adminController.listAdvisors);
router.patch(
  '/advisors/:id/verification-status',
  validateBody(overrideStatusSchema),
  adminController.overrideVerificationStatus,
);

export const adminRouter = router;
