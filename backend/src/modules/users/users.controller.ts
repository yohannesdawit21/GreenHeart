import type { Request, Response } from 'express';
import * as usersService from './users.service.js';

export async function updateMyProfile(req: Request, res: Response) {
  const user = await usersService.updateProfile(req.auth!.userId, req.body);
  res.json({ user });
}

export async function listAdvisors(_req: Request, res: Response) {
  const advisors = await usersService.listAdvisors();
  res.json({ advisors });
}

export async function getAdvisor(req: Request, res: Response) {
  const advisorId = req.params.id as string;
  const advisor = await usersService.getAdvisorById(advisorId);
  res.json({ advisor });
}
