import type { Request, Response } from 'express';
import {
  clearAuthCookie,
  setAuthCookie,
  signAuthToken,
} from '../../shared/middleware/auth.middleware.js';
import * as authService from './auth.service.js';

export async function register(req: Request, res: Response) {
  const user = await authService.registerClient(req.body);
  const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

export async function registerAdvisor(req: Request, res: Response) {
  const user = await authService.registerAdvisor(req.body);
  const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const user = await authService.login(req.body);
  const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });
  setAuthCookie(res, token);
  res.json({ user });
}

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.auth!.userId);
  res.json({ user });
}
