import { apiClient } from './client';
import type { 
  AdvisorListResponse, 
  AdvisorDetailResponse, 
  UpdateProfileRequest,
  AdvisorCardDto
} from '@shared/contracts/users.api';

export const userService = {
  getAdvisors: async (): Promise<AdvisorListResponse> => {
    const response = await apiClient.get<AdvisorListResponse>('/users/advisors');
    return response.data;
  },

  getAdvisorDetail: async (id: string): Promise<AdvisorDetailResponse> => {
    const response = await apiClient.get<AdvisorDetailResponse>(`/users/advisors/${id}`);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<AdvisorCardDto> => {
    const response = await apiClient.patch<AdvisorCardDto>('/users/profile', data);
    return response.data;
  },
};
