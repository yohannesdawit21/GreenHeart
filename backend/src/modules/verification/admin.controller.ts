import type { Request, Response } from 'express';
import * as walletService from '../wallet/wallet.service.js';
import * as verificationService from './verification.service.js';

export async function registerPartnerDoctor(req: Request, res: Response) {
  const partner = await verificationService.createPartnerDoctor(req.body);
  res.status(201).json({ partner });
}

export async function listPartnerDoctors(_req: Request, res: Response) {
  const partners = await verificationService.listPartnerDoctors();
  res.json({ partners });
}

export async function updatePartnerDoctor(req: Request, res: Response) {
  const partner = await verificationService.updatePartnerDoctor(req.params.id as string, req.body);
  res.json({ partner });
}

export async function deletePartnerDoctor(req: Request, res: Response) {
  const result = await verificationService.deletePartnerDoctor(req.params.id as string);
  res.json(result);
}

export async function listAdvisors(_req: Request, res: Response) {
  const applicants = await verificationService.listAllAdvisorsForAdmin();
  res.json({ applicants });
}

export async function overrideVerificationStatus(req: Request, res: Response) {
  const result = await verificationService.overrideAdvisorVerificationStatus(
    req.params.id as string,
    req.body.status,
  );
  res.json(result);
}

export async function getPlatformStats(_req: Request, res: Response) {
  const stats = await walletService.getPlatformStats();
  res.json(stats);
}
