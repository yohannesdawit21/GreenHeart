import { apiClient } from './client';
import type { 
  ApplicantListResponse, 
  PartnerDoctorListResponse,
  RegisterPartnerDoctorRequest,
  StartInterviewRequest,
  StartInterviewResponse,
  CompleteInterviewRequest,
  CompleteInterviewResponse,
  OverrideVerificationStatusRequest,
  VerificationLiveKitTokenResponse
} from '@shared/contracts/verification.api';

export const verificationService = {
  getApplicants: async (): Promise<ApplicantListResponse> => {
    const response = await apiClient.get<ApplicantListResponse>('/verification/applicants');
    return response.data;
  },

  getPartners: async (): Promise<PartnerDoctorListResponse> => {
    const response = await apiClient.get<PartnerDoctorListResponse>('/verification/partners');
    return response.data;
  },

  registerPartner: async (data: RegisterPartnerDoctorRequest): Promise<void> => {
    await apiClient.post('/verification/partners', data);
  },

  startInterview: async (data: StartInterviewRequest): Promise<StartInterviewResponse> => {
    const response = await apiClient.post<StartInterviewResponse>('/verification/interview/start', data);
    return response.data;
  },

  getInterviewToken: async (interviewId: string): Promise<VerificationLiveKitTokenResponse> => {
    const response = await apiClient.get<VerificationLiveKitTokenResponse>(`/verification/interview/${interviewId}/token`);
    return response.data;
  },

  completeInterview: async (interviewId: string, data: CompleteInterviewRequest): Promise<CompleteInterviewResponse> => {
    const response = await apiClient.post<CompleteInterviewResponse>(`/verification/interview/${interviewId}/complete`, data);
    return response.data;
  },

  overrideStatus: async (applicantId: string, data: OverrideVerificationStatusRequest): Promise<void> => {
    await apiClient.post(`/verification/applicants/${applicantId}/override`, data);
  },
};
