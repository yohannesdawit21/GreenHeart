import { apiClient } from './client';
import type { 
  LoginRequest, 
  RegisterRequest, 
  RegisterAdvisorRequest,
  AuthResponse, 
  MeResponse 
} from '@shared/contracts/auth.api';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  registerAdvisor: async (data: RegisterAdvisorRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register/advisor', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  },
};
