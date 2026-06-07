import { AppError } from '../../shared/errors/AppError.js';
import { getRatingAggregatesForAdvisors } from '../reviews/reviews.service.js';
import { getOnlineAdvisorIds } from '../presence/presence.repository.js';
import { toAdvisorCard, toAuthUser } from './users.mapper.js';
import * as usersRepo from './users.repository.js';
import type { AdvisorCardDto, UpdateProfileRequest } from '../../shared/types/contracts.js';

async function withOnlineStatus<T extends { id: string }>(cards: T[]): Promise<(T & { isOnline?: boolean })[]> {
  const onlineIds = await getOnlineAdvisorIds();
  return cards.map((c) => ({ ...c, isOnline: onlineIds.has(c.id) }));
}

async function enrichAdvisorCards(rows: Awaited<ReturnType<typeof usersRepo.listVerifiedAdvisors>>): Promise<AdvisorCardDto[]> {
  const advisorIds = rows.map((r) => r.id);
  const ratingMap = await getRatingAggregatesForAdvisors(advisorIds);
  return rows.map((row) => {
    const meta = ratingMap.get(row.id);
    return toAdvisorCard(row, meta);
  });
}

export async function updateProfile(userId: string, updates: UpdateProfileRequest) {
  const user = await usersRepo.updateUserProfile(userId, updates);
  return toAuthUser(user);
}

export async function listAdvisors() {
  const rows = await usersRepo.listVerifiedAdvisors();
  const cards = await enrichAdvisorCards(rows);
  return withOnlineStatus(cards);
}

export async function getAdvisorById(advisorId: string) {
  const advisor = await usersRepo.findAdvisorById(advisorId);
  if (!advisor) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Advisor not found');
  }
  const ratingMap = await getRatingAggregatesForAdvisors([advisorId]);
  const [withOnline] = await withOnlineStatus([toAdvisorCard(advisor, ratingMap.get(advisorId))]);
  return withOnline;
}
