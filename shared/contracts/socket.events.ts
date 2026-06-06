/**
 * WebSocket event contracts — Owner: Role C
 * @see agent/api-contracts.md
 */

export interface IncomingCallDispatchPayload {
  sessionId: string;
  clientName: string;
  durationMinutes: number;
  signalType?: string;
  subjectId?: string;
}

export interface CallAcceptedPayload {
  sessionId: string;
}

export interface CallDeclinedPayload {
  sessionId: string;
  reason?: string;
}

export interface SessionReadyPayload {
  sessionId: string;
  livekitToken: string;
  livekitUrl: string;
  roomName: string;
}

export interface CallProcessingPayload {
  sessionId: string;
  status: 'ringing' | 'connecting';
}

export interface VerificationInterviewStartedPayload {
  interviewId: string;
  partnerName: string;
}

export interface VerificationInterviewAcceptedPayload {
  interviewId: string;
  applicantName: string;
}

export interface VerificationInterviewDeclinedPayload {
  interviewId: string;
  applicantName: string;
}

export interface VerificationInterviewCompletedPayload {
  interviewId: string;
  outcome: 'pass' | 'fail';
  verificationStatus: 'verified' | 'rejected';
}

/** Server → Client/Advisor */
export interface ServerToClientEvents {
  incoming_call_dispatch: (payload: IncomingCallDispatchPayload) => void;
  session_ready: (payload: SessionReadyPayload) => void;
  call_processing: (payload: CallProcessingPayload) => void;
  verification_interview_started: (payload: VerificationInterviewStartedPayload) => void;
  verification_interview_accepted: (payload: VerificationInterviewAcceptedPayload) => void;
  verification_interview_declined: (payload: VerificationInterviewDeclinedPayload) => void;
  verification_interview_completed: (payload: VerificationInterviewCompletedPayload) => void;
}

/** Client/Advisor → Server */
export interface ClientToServerEvents {
  call_accepted: (payload: CallAcceptedPayload) => void;
  call_declined: (payload: CallDeclinedPayload) => void;
  presence_ping: (payload: { advisorId: string; online: boolean }) => void;
}

export type CodexSocketEvents = ServerToClientEvents & ClientToServerEvents;
