/**
 * Search API contracts — Owner: Role C
 * Backend: POST /api/search/semantic, POST /api/search/reindex/:advisorId
 */

import type { AdvisorCardDto } from './users.api';

export interface SemanticSearchRequest {
  query: string;
  limit?: number;
}

export interface SemanticSearchResult extends AdvisorCardDto {
  matchScore: number;
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  query: string;
}

export interface ReindexResponse {
  userId: string;
  indexed: boolean;
}
