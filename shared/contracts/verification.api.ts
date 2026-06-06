/**
 * Verification API contracts — Owner: Role B (APIs) + Role C (LiveKit tokens)
 */

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected' | 'suspended';

export type VerificationInterviewStatus = 'scheduled' | 'in_progress' | 'completed';
export type VerificationOutcome = 'pass' | 'fail';

export interface VerificationInterviewLiveKitResponse {
  interviewId: string;
  roomName: string;
  url: string;
  token: string;
}

export interface VerificationInterviewTokensForRoleB {
  roomName: string;
  url: string;
  partnerToken: string;
  applicantToken: string;
}
