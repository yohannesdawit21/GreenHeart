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

const updatePartnerDoctorSchema = z
  .object({
    email: z.string().email().max(255).optional(),
    password: z.string().min(8).max(128).optional(),
    username: z.string().min(2).max(100).optional(),
  })
  .refine((data) => data.email !== undefined || data.password !== undefined || data.username !== undefined, {
    message: 'At least one field must be provided',
  });

const overrideStatusSchema = z.object({
  status: z.enum(['pending_review', 'verified', 'rejected', 'suspended']),
});

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.post('/partner-doctors', validateBody(partnerDoctorSchema), adminController.registerPartnerDoctor);
router.get('/partner-doctors', adminController.listPartnerDoctors);
router.patch(
  '/partner-doctors/:id',
  validateBody(updatePartnerDoctorSchema),
  adminController.updatePartnerDoctor,
);
router.delete('/partner-doctors/:id', adminController.deletePartnerDoctor);
router.get('/advisors', adminController.listAdvisors);
router.patch(
  '/advisors/:id/verification-status',
  validateBody(overrideStatusSchema),
  adminController.overrideVerificationStatus,
);

export const adminRouter = router;
