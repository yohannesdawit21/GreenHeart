import type { AdvisorCardDto, ApplicantDto, AuthUser, PartnerDoctorDto } from '../../shared/types/contracts.js';
import type { AdvisorRow, ApplicantRow, UserWithProfileRow } from './users.repository.js';

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
      ...(row.verification_status ? { verificationStatus: row.verification_status } : {}),
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

export function toApplicantDto(row: ApplicantRow): ApplicantDto {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    bio: row.bio,
    tags: row.tags ?? [],
    coinRatePerSession: row.coin_rate_per_session,
    verificationStatus: row.verification_status,
    createdAt: row.created_at.toISOString(),
  };
}

export function toPartnerDoctorDto(row: ApplicantRow): PartnerDoctorDto {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at.toISOString(),
  };
}
