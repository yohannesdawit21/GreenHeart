import cookieParser from 'cookie-parser';
import express from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { presenceRouter } from './modules/presence/presence.routes.js';
import { searchRouter } from './modules/search/search.routes.js';
import { sessionsRouter } from './modules/sessions/sessions.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { adminRouter } from './modules/verification/admin.routes.js';
import { verificationRouter } from './modules/verification/verification.routes.js';
import { walletRouter } from './modules/wallet/wallet.routes.js';
import { reviewsRouter } from './modules/reviews/reviews.routes.js';
import { verificationLiveKitRouter } from './livekit/verification.routes.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { notFoundHandler } from './shared/middleware/notFoundHandler.js';
import { createCorsMiddleware, corsErrorHeaders } from './shared/middleware/cors.middleware.js';

export function createApp() {
  const app = express();

  app.use(createCorsMiddleware());
  app.use(corsErrorHeaders);
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'codex-api' });
  });

  // --- Role B routes (M2, M3, M6) ---
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/wallet', walletRouter);
  app.use('/api/verification', verificationRouter);
  app.use('/api/admin', adminRouter);

  // --- Role C routes (M4, M5, M6 LiveKit token) ---
  app.use('/api/search', searchRouter);
  app.use('/api/presence', presenceRouter);
  app.use('/api/session', sessionsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/verification/interviews', verificationLiveKitRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
