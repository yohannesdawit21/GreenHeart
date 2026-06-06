import { apiClient } from './client';
import type {
  ApplicantListResponse,
  PartnerDoctorListResponse,
  RegisterPartnerDoctorRequest,
  StartInterviewRequest,
  StartInterviewResponse,
  CompleteInterviewRequest,
  CompleteInterviewResponse,
  MyVerificationInterviewResponse,
  InterviewAvailabilityResponse,
  VerificationInterviewActionResponse,
  OverrideVerificationStatusRequest,
  VerificationLiveKitTokenResponse,
} from '@shared/contracts/verification.api';

export const verificationService = {
  getApplicants: async (): Promise<ApplicantListResponse> => {
    const response = await apiClient.get<ApplicantListResponse>('/verification/applicants');
    return response.data;
  },

  /** Admin — all advisors with verification status */
  getAdminAdvisors: async (): Promise<ApplicantListResponse> => {
    const response = await apiClient.get<ApplicantListResponse>('/admin/advisors');
    return response.data;
  },

  getPartners: async (): Promise<PartnerDoctorListResponse> => {
    const response = await apiClient.get<PartnerDoctorListResponse>('/admin/partner-doctors');
    return response.data;
  },

  registerPartner: async (data: RegisterPartnerDoctorRequest): Promise<void> => {
    await apiClient.post('/admin/partner-doctors', data);
  },

  startInterview: async (data: StartInterviewRequest): Promise<StartInterviewResponse> => {
    const response = await apiClient.post<StartInterviewResponse>('/verification/interviews', data);
    return response.data;
  },

  getInterviewToken: async (interviewId: string): Promise<VerificationLiveKitTokenResponse> => {
    const response = await apiClient.get<VerificationLiveKitTokenResponse>(
      `/verification/interviews/${interviewId}/livekit-token`,
    );
    return response.data;
  },

  getMyInterview: async (): Promise<MyVerificationInterviewResponse> => {
    const response = await apiClient.get<MyVerificationInterviewResponse>('/verification/my-interview');
    return response.data;
  },

  getInterviewAvailability: async (): Promise<InterviewAvailabilityResponse> => {
    const response = await apiClient.get<InterviewAvailabilityResponse>('/verification/availability');
    return response.data;
  },

  updateInterviewAvailability: async (available: boolean): Promise<InterviewAvailabilityResponse> => {
    const response = await apiClient.patch<InterviewAvailabilityResponse>('/verification/availability', {
      available,
    });
    return response.data;
  },

  acceptInterview: async (interviewId: string): Promise<VerificationInterviewActionResponse> => {
    const response = await apiClient.post<VerificationInterviewActionResponse>(
      `/verification/interviews/${interviewId}/accept`,
    );
    return response.data;
  },

  declineInterview: async (interviewId: string): Promise<VerificationInterviewActionResponse> => {
    const response = await apiClient.post<VerificationInterviewActionResponse>(
      `/verification/interviews/${interviewId}/decline`,
    );
    return response.data;
  },

  completeInterview: async (
    interviewId: string,
    data: CompleteInterviewRequest,
  ): Promise<CompleteInterviewResponse> => {
    const response = await apiClient.patch<CompleteInterviewResponse>(
      `/verification/interviews/${interviewId}/complete`,
      data,
    );
    return response.data;
  },

  overrideStatus: async (advisorId: string, data: OverrideVerificationStatusRequest): Promise<void> => {
    await apiClient.patch(`/admin/advisors/${advisorId}/verification-status`, data);
  },
};
