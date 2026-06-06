import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { validateBody } from '../../shared/middleware/validateBody.js';
import * as authController from './auth.controller.js';
import { loginSchema, registerAdvisorSchema, registerSchema } from './auth.schemas.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/register/advisor', validateBody(registerAdvisorSchema), authController.registerAdvisor);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export const authRouter = router;
