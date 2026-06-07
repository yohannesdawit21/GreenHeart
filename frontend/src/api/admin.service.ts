import { apiClient } from './client';
import type { PlatformStatsResponse } from '@shared/contracts/wallet.api';

export const adminService = {
  getPlatformStats: async (): Promise<PlatformStatsResponse> => {
    const response = await apiClient.get<PlatformStatsResponse>('/admin/platform-stats');
    return response.data;
  },
};
