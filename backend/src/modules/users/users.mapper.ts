import type { AdvisorCardDto, AuthUser } from '../../shared/types/contracts.js';
import type { AdvisorRow, UserWithProfileRow } from './users.repository.js';

export function toAuthUser(row: UserWithProfileRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    profile: {
      username: row.username,
      bio: row.bio,
      tags: row.tags ?? [],
      coinRatePerSession: row.coin_rate_per_session,
    },
  };
}

export function toAdvisorCard(row: AdvisorRow): AdvisorCardDto {
  return {
    id: row.id,
    username: row.username,
    bio: row.bio,
    tags: row.tags ?? [],
    coinRatePerSession: row.coin_rate_per_session,
  };
}
