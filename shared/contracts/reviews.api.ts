/**
 * Reviews API contracts
 */

export interface ReviewDto {
  id: string;
  sessionId: string;
  clientId: string;
  advisorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SubmitReviewRequest {
  sessionId: string;
  rating: number;
  comment?: string;
}

export interface SubmitReviewResponse {
  review: ReviewDto;
}

export interface AdvisorReviewsResponse {
  advisorId: string;
  averageRating: number;
  reviewCount: number;
  reviews: ReviewDto[];
}
