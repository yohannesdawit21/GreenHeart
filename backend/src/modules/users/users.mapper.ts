import type { AdvisorCardDto, ApplicantDto, AuthUser, PartnerDoctorDto } from '../../shared/types/contracts.js';
import type { AdvisorRow, ApplicantRow, UserWithProfileRow } from './users.repository.js';
import { isEmptyCredentials, parseAdvisorCredentials } from './advisorCredentials.util.js';

function mapCredentials(row: { advisor_credentials?: unknown }) {
  const parsed = parseAdvisorCredentials(row.advisor_credentials);
  return parsed && !isEmptyCredentials(parsed) ? parsed : undefined;
}

export function toAuthUser(row: UserWithProfileRow): AuthUser {
  const credentials = mapCredentials(row);
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
      ...(credentials ? { credentials } : {}),
    },
  };
}

export function toAdvisorCard(
  row: AdvisorRow,
  ratingMeta?: { averageRating: number; reviewCount: number },
): AdvisorCardDto {
  const credentials = mapCredentials(row);
  return {
    id: row.id,
    username: row.username,
    bio: row.bio,
    tags: row.tags ?? [],
    coinRatePerSession: row.coin_rate_per_session,
    ...(credentials ? { credentials } : {}),
    ...(ratingMeta && ratingMeta.reviewCount > 0
      ? { rating: ratingMeta.averageRating, reviewCount: ratingMeta.reviewCount }
      : {}),
  };
}

export function toApplicantDto(row: ApplicantRow): ApplicantDto {
  const credentials = mapCredentials(row);
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    bio: row.bio,
    tags: row.tags ?? [],
    coinRatePerSession: row.coin_rate_per_session,
    verificationStatus: row.verification_status,
    createdAt: row.created_at.toISOString(),
    ...(credentials ? { credentials } : {}),
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
