import { apiClient } from './client';
import type {
  AdvisorReviewsResponse,
  ClientReviewsResponse,
  SubmitReviewRequest,
  SubmitReviewResponse,
} from '@shared/contracts/reviews.api';

export const reviewsService = {
  submitReview: async (data: SubmitReviewRequest): Promise<SubmitReviewResponse> => {
    const response = await apiClient.post<SubmitReviewResponse>('/reviews', data);
    return response.data;
  },

  getAdvisorReviews: async (advisorId: string): Promise<AdvisorReviewsResponse> => {
    const response = await apiClient.get<AdvisorReviewsResponse>(`/reviews/advisor/${advisorId}`);
    return response.data;
  },

  getMyReviews: async (): Promise<ClientReviewsResponse> => {
    const response = await apiClient.get<ClientReviewsResponse>('/reviews/me');
    return response.data;
  },
};
