/**
 * Verification & RBAC API contracts — Owner: Role B + Role C (LiveKit)
 * @see agent/api-contracts.md
 * @see agent/modules/M6-advisor-verification.md
 */

import type { AdvisorCredentials } from './models.advisor.js';

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
  /** Structured credential fields from apply wizard */
  credentials?: AdvisorCredentials;
  /** Open for verification interview (pending applicants only) */
  isOnline?: boolean;
}

export interface InterviewAvailabilityRequest {
  available: boolean;
}

export interface InterviewAvailabilityResponse {
  available: boolean;
}

/** GET /api/admin/advisors — admin list of all advisors + verification status */
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

export interface UpdatePartnerDoctorRequest {
  email?: string;
  username?: string;
  password?: string;
}

export interface PartnerDoctorResponse {
  partner: PartnerDoctorDto;
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
  applicantOnline: boolean;
  applicantUsername: string;
}

export interface VerificationInterviewActionResponse {
  interviewId: string;
  ok: true;
}

/** GET /api/verification/my-interview — active interview for logged-in advisor applicant */
export interface MyVerificationInterviewResponse {
  interviewId: string | null;
  partnerName?: string;
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

/** GET /api/verification/interviews/:id/livekit-token — Role C implements token service */
export interface VerificationLiveKitTokenResponse {
  token: string;
  livekitUrl: string;
  roomName: string;
}

/** Role C helper — tokens for partner + applicant when interview starts (Role B calls livekit service) */
export interface VerificationInterviewTokensForRoleB {
  roomName: string;
  url: string;
  partnerToken: string;
  applicantToken: string;
}
