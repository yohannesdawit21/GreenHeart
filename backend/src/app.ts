import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config/index.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { presenceRouter } from './modules/presence/presence.routes.js';
import { searchRouter } from './modules/search/search.routes.js';
import { sessionsRouter } from './modules/sessions/sessions.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { adminRouter } from './modules/verification/admin.routes.js';
import { verificationRouter } from './modules/verification/verification.routes.js';
import { walletRouter } from './modules/wallet/wallet.routes.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { notFoundHandler } from './shared/middleware/notFoundHandler.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
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

  // --- Role C routes (M4, M5) ---
  app.use('/api/search', searchRouter);
  app.use('/api/presence', presenceRouter);
  app.use('/api/session', sessionsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
