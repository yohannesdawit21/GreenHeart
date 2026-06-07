import { apiClient } from './client';
import type {
  PresenceStatusRequest,
  PresenceStatusResponse,
  AdvisorPresenceStatusResponse,
  OnlineAdvisorsResponse,
  InitiateSessionRequest,
  InitiateSessionResponse,
  LiveKitTokenResponse,
  SessionActionResponse,
  SessionStatusResponse,
} from '@shared/contracts/session.api';

export const sessionService = {
  updatePresence: async (data: PresenceStatusRequest): Promise<PresenceStatusResponse> => {
    const response = await apiClient.patch<PresenceStatusResponse>('/presence/status', data);
    return response.data;
  },

  getOnlineAdvisors: async (): Promise<OnlineAdvisorsResponse> => {
    const response = await apiClient.get<OnlineAdvisorsResponse>('/presence/advisors');
    return response.data;
  },

  getMyPresence: async (): Promise<AdvisorPresenceStatusResponse> => {
    const response = await apiClient.get<AdvisorPresenceStatusResponse>('/presence/me');
    return response.data;
  },

  initiateSession: async (data: InitiateSessionRequest): Promise<InitiateSessionResponse> => {
    const response = await apiClient.post<InitiateSessionResponse>('/session/initiate', data);
    return response.data;
  },

  getSessionStatus: async (sessionId: string): Promise<SessionStatusResponse> => {
    const response = await apiClient.get<SessionStatusResponse>(`/session/${sessionId}/status`);
    return response.data;
  },

  getLiveKitToken: async (sessionId: string): Promise<LiveKitTokenResponse> => {
    const response = await apiClient.get<LiveKitTokenResponse>(`/session/${sessionId}/livekit-token`);
    return response.data;
  },

  acceptSession: async (sessionId: string): Promise<SessionActionResponse> => {
    const response = await apiClient.post<SessionActionResponse>(`/session/${sessionId}/accept`);
    return response.data;
  },

  declineSession: async (sessionId: string): Promise<SessionActionResponse> => {
    const response = await apiClient.post<SessionActionResponse>(`/session/${sessionId}/decline`);
    return response.data;
  },

  endSession: async (sessionId: string): Promise<SessionActionResponse> => {
    const response = await apiClient.post<SessionActionResponse>(`/session/${sessionId}/end`);
    return response.data;
  },
};
