import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import type { UserRole } from '../types/contracts.js';
import { AppError } from '../errors/AppError.js';

const AUTH_COOKIE = 'auth_token';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] });
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.cookieSameSite,
  });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = bearer || (req.cookies?.[AUTH_COOKIE] as string | undefined);
  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    next();
  };
}
