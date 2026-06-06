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

export async function getMyInterview(req: Request, res: Response) {
  const result = await verificationService.getMyActiveInterview(req.auth!.userId);
  res.json(result);
}

export async function acceptInterview(req: Request, res: Response) {
  const result = await verificationService.acceptInterview(
    req.auth!.userId,
    req.params.id as string,
  );
  res.json(result);
}

export async function declineInterview(req: Request, res: Response) {
  const result = await verificationService.declineInterview(
    req.auth!.userId,
    req.params.id as string,
  );
  res.json(result);
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
