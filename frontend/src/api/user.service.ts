import { apiClient } from './client';
import type {
  AdvisorListResponse,
  AdvisorDetailResponse,
  UpdateProfileRequest,
} from '@shared/contracts/users.api';
import type { MeResponse } from '@shared/contracts/auth.api';

export const userService = {
  getAdvisors: async (): Promise<AdvisorListResponse> => {
    const response = await apiClient.get<AdvisorListResponse>('/users/advisors');
    return response.data;
  },

  getAdvisorDetail: async (id: string): Promise<AdvisorDetailResponse> => {
    const response = await apiClient.get<AdvisorDetailResponse>(`/users/advisors/${id}`);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<MeResponse> => {
    const response = await apiClient.patch<MeResponse>('/users/me/profile', data);
    return response.data;
  },
};
