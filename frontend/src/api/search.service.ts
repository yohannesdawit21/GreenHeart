import { apiClient } from './client';
import type { SemanticSearchRequest, SemanticSearchResponse } from '@shared/contracts/search.api';

export const searchService = {
  semanticSearch: async (data: SemanticSearchRequest): Promise<SemanticSearchResponse> => {
    const response = await apiClient.post<SemanticSearchResponse>('/search/semantic', data);
    return response.data;
  },
};
