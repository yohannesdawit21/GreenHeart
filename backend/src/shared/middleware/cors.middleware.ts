import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { config } from '../../config/index.js';

/** Logged at startup so production logs confirm CORS mode. */
export function logCorsMode(): void {
  if (config.corsAllowAll) {
    console.log('[cors] allow-all origins enabled (CORS_ORIGIN=* or CORS_ALLOW_ALL=true)');
    return;
  }
  console.log(`[cors] restricted origins: ${config.corsOrigins.join(', ') || '(none configured)'}`);
}

export function createCorsMiddleware() {
  if (config.corsAllowAll) {
    return cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    });
  }

  return cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  });
}

/** Ensure error responses still include CORS headers for browser clients. */
export function corsErrorHeaders(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (origin && (config.corsAllowAll || config.corsOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', config.corsAllowAll ? origin : origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
}
