import type { Request, Response } from 'express';
import * as verificationService from './verification.service.js';

export async function registerPartnerDoctor(req: Request, res: Response) {
  const partner = await verificationService.createPartnerDoctor(req.body);
  res.status(201).json({ partner });
}

export async function listPartnerDoctors(_req: Request, res: Response) {
  const partners = await verificationService.listPartnerDoctors();
  res.json({ partners });
}

export async function overrideVerificationStatus(req: Request, res: Response) {
  const result = await verificationService.overrideAdvisorVerificationStatus(
    req.params.id as string,
    req.body.status,
  );
  res.json(result);
}
