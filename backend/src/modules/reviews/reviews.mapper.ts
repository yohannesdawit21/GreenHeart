import type { ReviewDto } from '../../shared/types/contracts.js';
import type { ClientReviewRow, ReviewRow } from './reviews.repository.js';

export function toReviewDto(row: ReviewRow): ReviewDto {
  return {
    id: row.id,
    sessionId: row.session_id,
    clientId: row.client_id,
    advisorId: row.advisor_id,
    rating: row.rating,
    ...(row.comment ? { comment: row.comment } : {}),
    createdAt: row.created_at.toISOString(),
  };
}

export function toClientReviewDto(row: ClientReviewRow) {
  return {
    ...toReviewDto(row),
    advisorName: row.advisor_username,
  };
}
