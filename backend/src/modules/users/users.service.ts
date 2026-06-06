import { AppError } from '../../shared/errors/AppError.js';
import { toAdvisorCard, toAuthUser } from './users.mapper.js';
import * as usersRepo from './users.repository.js';
import type { UpdateProfileRequest } from '../../shared/types/contracts.js';

export async function updateProfile(userId: string, updates: UpdateProfileRequest) {
  const user = await usersRepo.updateUserProfile(userId, updates);
  return toAuthUser(user);
}

export async function listAdvisors() {
  const rows = await usersRepo.listVerifiedAdvisors();
  return rows.map(toAdvisorCard);
}

export async function getAdvisorById(advisorId: string) {
  const advisor = await usersRepo.findAdvisorById(advisorId);
  if (!advisor) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Advisor not found');
  }
  return toAdvisorCard(advisor);
}
