import type { Request, Response } from 'express';
import * as verificationService from './verification.service.js';

export async function listApplicants(_req: Request, res: Response) {
  const applicants = await verificationService.listApplicants();
  res.json({ applicants });
}

export async function startInterview(req: Request, res: Response) {
  const result = await verificationService.startInterview(
    req.auth!.userId,
    req.body.applicantId,
  );
  res.status(201).json(result);
}

export async function completeInterview(req: Request, res: Response) {
  const result = await verificationService.completeInterview(
    req.auth!.userId,
    req.params.id as string,
    req.body.outcome,
    req.body.notes,
  );
  res.json(result);
}

export async function getLivekitToken(req: Request, res: Response) {
  const interview = await verificationService.getInterviewForTokenRequest(
    req.auth!.userId,
    req.params.id as string,
  );
  // Role C implements full token minting — stub until M5 LiveKit service is ready
  res.json({
    token: '',
    livekitUrl: process.env.LIVEKIT_URL ?? '',
    roomName: interview.livekit_room,
    _note: 'LiveKit token minting — implement in Role C (M5/M6)',
  });
}
