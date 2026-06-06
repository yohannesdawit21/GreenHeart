/**
 * Users API contracts — Owner: Role B
 */

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
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  tags?: string[];
  coinRatePerSession?: number;
}

export interface AdvisorListResponse {
  advisors: AdvisorCardDto[];
}

export interface AdvisorDetailResponse {
  advisor: AdvisorCardDto;
}
