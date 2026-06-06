import { AppError } from '../../shared/errors/AppError.js';
import { listOnlineAdvisorIds } from '../presence/presence.repository.js';
import { toAdvisorCard, toAuthUser } from './users.mapper.js';
import * as usersRepo from './users.repository.js';
import type { UpdateProfileRequest } from '../../shared/types/contracts.js';

async function withOnlineStatus<T extends { id: string }>(cards: T[]): Promise<(T & { isOnline?: boolean })[]> {
  const onlineIds = new Set(await listOnlineAdvisorIds());
  return cards.map((c) => ({ ...c, isOnline: onlineIds.has(c.id) }));
}

export async function updateProfile(userId: string, updates: UpdateProfileRequest) {
  const user = await usersRepo.updateUserProfile(userId, updates);
  return toAuthUser(user);
}

export async function listAdvisors() {
  const rows = await usersRepo.listVerifiedAdvisors();
  return withOnlineStatus(rows.map(toAdvisorCard));
}

export async function getAdvisorById(advisorId: string) {
  const advisor = await usersRepo.findAdvisorById(advisorId);
  if (!advisor) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Advisor not found');
  }
  const [withOnline] = await withOnlineStatus([toAdvisorCard(advisor)]);
  return withOnline;
}
