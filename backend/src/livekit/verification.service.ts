import {
  buildVerificationRoomName,
  createLiveKitToken,
  type LiveKitCredentials,
} from './token.service.js';

export interface VerificationInterviewTokens {
  roomName: string;
  url: string;
  partnerToken: string;
  applicantToken: string;
}

export async function createVerificationInterviewTokens(input: {
  interviewId: string;
  partnerDoctorId: string;
  applicantId: string;
  partnerName?: string;
  applicantName?: string;
}): Promise<VerificationInterviewTokens> {
  const roomName = buildVerificationRoomName(input.interviewId);

  const [partner, applicant] = await Promise.all([
    createLiveKitToken(roomName, input.partnerDoctorId, input.partnerName ?? 'Partner Doctor'),
    createLiveKitToken(roomName, input.applicantId, input.applicantName ?? 'Applicant'),
  ]);

  return {
    roomName,
    url: partner.url,
    partnerToken: partner.token,
    applicantToken: applicant.token,
  };
}

/** Token for the authenticated participant joining a verification room. */
export async function createVerificationParticipantToken(input: {
  interviewId: string;
  userId: string;
  displayName?: string;
}): Promise<LiveKitCredentials> {
  const roomName = buildVerificationRoomName(input.interviewId);
  return createLiveKitToken(roomName, input.userId, input.displayName);
}

export { buildVerificationRoomName };
