/**
 * Users API contracts — Owner: Role B
 */

import type { AdvisorCredentials } from './models.advisor.js';

export interface AdvisorCardDto {
  id: string;
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
  rating?: number;
  reviewCount?: number;
  isOnline?: boolean;
  avatarUrl?: string;
  credentials?: AdvisorCredentials;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  tags?: string[];
  coinRatePerSession?: number;
  credentials?: AdvisorCredentials;
}

export interface AdvisorListResponse {
  advisors: AdvisorCardDto[];
}

export interface AdvisorDetailResponse {
  advisor: AdvisorCardDto;
}
