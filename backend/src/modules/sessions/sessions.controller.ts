import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError.js';
import {
  acceptSession,
  declineSession,
  endSession,
  getLiveKitTokenForSession,
  getSessionStatus,
  initiateSession,
} from './sessions.service.js';

export async function postInitiate(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.auth!.role !== 'client') {
      throw new AppError(403, 'FORBIDDEN', 'Only clients can initiate sessions');
    }
    const { advisorId } = req.body as { advisorId: string };
    const result = await initiateSession(req.auth!.userId, advisorId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function postAccept(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.id as string;
    const result = await acceptSession(req.auth!.userId, sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function postDecline(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.id as string;
    const { reason } = (req.body ?? {}) as { reason?: string };
    const result = await declineSession(req.auth!.userId, sessionId, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function postEnd(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.id as string;
    const result = await endSession(req.auth!.userId, sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getLiveKitToken(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.id as string;
    const result = await getLiveKitTokenForSession(req.auth!.userId, sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSessionStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.id as string;
    const result = await getSessionStatus(req.auth!.userId, sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
