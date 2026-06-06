import { config } from '../../config/index.js';
import { getOnlineAdvisorIds } from '../presence/presence.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import {
  deleteAdvisorEmbedding,
  findAdvisorProfile,
  semanticSearchAdvisors,
  upsertAdvisorEmbedding,
} from './advisorEmbedding.repository.js';
import {
  buildAdvisorEmbeddingText,
  embedText,
  toVectorLiteral,
} from './embedding.service.js';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

export interface SemanticSearchResultDto {
  id: string;
  username: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
  isOnline?: boolean;
  matchScore: number;
}

export interface SemanticSearchResponseDto {
  results: SemanticSearchResultDto[];
  query: string;
}

export interface ReindexResponseDto {
  userId: string;
  indexed: boolean;
}

function distanceToMatchScore(distance: number): number {
  return Math.max(0, Math.min(1, 1 - distance));
}

function assertAdvisorEligibleForIndex(verificationStatus: string | null): void {
  if (verificationStatus == null) return;
  if (verificationStatus !== 'verified') {
    throw new AppError(
      403,
      'ADVISOR_NOT_VERIFIED',
      'Only verified advisors can be indexed for search',
    );
  }
}

export async function semanticSearch(query: string, limit = DEFAULT_LIMIT): Promise<SemanticSearchResponseDto> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Search query is required');
  }

  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
  const embedding = await embedText(trimmedQuery);
  const vectorLiteral = toVectorLiteral(embedding);

  const rows = await semanticSearchAdvisors(
    vectorLiteral,
    config.embeddings.maxDistance,
    safeLimit,
  );

  const onlineIds = await getOnlineAdvisorIds();

  return {
    query: trimmedQuery,
    results: rows.map((row) => ({
      id: row.id,
      username: row.username,
      bio: row.bio,
      tags: row.tags,
      coinRatePerSession: row.coinRatePerSession,
      isOnline: onlineIds.has(row.id),
      matchScore: distanceToMatchScore(row.distance),
    })),
  };
}

export async function reindexAdvisor(advisorId: string): Promise<ReindexResponseDto> {
  const profile = await findAdvisorProfile(advisorId);
  if (!profile) {
    throw new AppError(404, 'NOT_FOUND', 'Advisor not found');
  }
  if (profile.role !== 'advisor') {
    throw new AppError(400, 'VALIDATION_ERROR', 'User is not an advisor');
  }

  assertAdvisorEligibleForIndex(profile.verificationStatus);

  const embeddingText = buildAdvisorEmbeddingText(profile.bio, profile.tags);
  if (!embeddingText) {
    await deleteAdvisorEmbedding(advisorId);
    return { userId: advisorId, indexed: false };
  }

  const embedding = await embedText(embeddingText);
  await upsertAdvisorEmbedding(
    advisorId,
    profile.tags,
    embeddingText,
    toVectorLiteral(embedding),
  );

  return { userId: advisorId, indexed: true };
}
