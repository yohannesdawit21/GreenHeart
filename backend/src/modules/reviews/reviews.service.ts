import { AppError } from '../../shared/errors/AppError.js';
import { findSessionByPublicId } from '../sessions/sessions.repository.js';
import { toReviewDto } from './reviews.mapper.js';
import * as reviewsRepo from './reviews.repository.js';

export async function submitReview(
  clientId: string,
  input: { sessionId: string; rating: number; comment?: string },
) {
  const session = await findSessionByPublicId(input.sessionId);
  if (!session) {
    throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }
  if (session.client_id !== clientId) {
    throw new AppError(403, 'FORBIDDEN', 'Only the client who had this session can leave a review');
  }
  if (session.status !== 'completed') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Reviews are only allowed after a completed session');
  }

  const existing = await reviewsRepo.findReviewBySessionId(input.sessionId);
  if (existing) {
    throw new AppError(409, 'VALIDATION_ERROR', 'A review already exists for this session');
  }

  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Rating must be between 1 and 5');
  }

  const comment = input.comment?.trim();
  const row = await reviewsRepo.createReview({
    sessionId: input.sessionId,
    clientId,
    advisorId: session.advisor_id,
    rating,
    comment: comment || undefined,
  });

  return { review: toReviewDto(row) };
}

export async function getAdvisorReviews(advisorId: string) {
  const [rows, aggregate] = await Promise.all([
    reviewsRepo.listReviewsForAdvisor(advisorId),
    reviewsRepo.getAdvisorRatingAggregate(advisorId),
  ]);

  return {
    advisorId,
    averageRating: aggregate ? Number(aggregate.average_rating) : 0,
    reviewCount: aggregate?.review_count ?? 0,
    reviews: rows.map(toReviewDto),
  };
}

export async function getRatingAggregatesForAdvisors(advisorIds: string[]) {
  return reviewsRepo.getRatingAggregatesForAdvisors(advisorIds);
}
