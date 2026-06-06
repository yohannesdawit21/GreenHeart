/**
 * Verification & RBAC API contracts — Owner: Role B
 * @see agent/api-contracts.md
 * @see agent/modules/M6-advisor-verification.md
 */

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected' | 'suspended';

export type InterviewOutcome = 'pass' | 'fail';

export interface ApplicantDto {
  id: string;
  username: string;
  email: string;
  bio: string;
  tags: string[];
  coinRatePerSession: number;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface ApplicantListResponse {
  applicants: ApplicantDto[];
}

export interface RegisterPartnerDoctorRequest {
  email: string;
  password: string;
  username: string;
}

export interface PartnerDoctorDto {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface PartnerDoctorListResponse {
  partners: PartnerDoctorDto[];
}

export interface StartInterviewRequest {
  applicantId: string;
}

export interface StartInterviewResponse {
  interviewId: string;
  livekitRoom?: string;
}

export interface CompleteInterviewRequest {
  outcome: InterviewOutcome;
}

export interface CompleteInterviewResponse {
  applicantId: string;
  verificationStatus: VerificationStatus;
}

export interface OverrideVerificationStatusRequest {
  status: VerificationStatus;
}

export interface VerificationLiveKitTokenResponse {
  token: string;
  livekitUrl: string;
  roomName: string;
}
