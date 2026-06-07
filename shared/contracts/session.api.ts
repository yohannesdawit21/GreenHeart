/**
 * Session & presence API contracts — Owner: Role C
 */

export type SessionStatus =
  | 'pending'
  | 'ringing'
  | 'active'
  | 'completed'
  | 'declined'
  | 'cancelled';

export interface PresenceStatusRequest {
  online: boolean;
}

export interface PresenceStatusResponse {
  advisorId: string;
  online: boolean;
}

export interface OnlineAdvisorsResponse {
  advisorIds: string[];
}

export interface AdvisorPresenceStatusResponse {
  advisorId: string;
  online: boolean;
  intendedOnline: boolean;
  socketConnected: boolean;
}

export interface InitiateSessionRequest {
  advisorId: string;
}

export interface InitiateSessionResponse {
  sessionId: string;
  status: SessionStatus;
  coinAmount: number;
  durationMinutes: number;
}

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  roomName: string;
}

export interface SessionActionResponse {
  sessionId: string;
  status: SessionStatus;
}

export interface SessionStatusResponse {
  sessionId: string;
  status: SessionStatus;
  coinAmount: number;
  durationMinutes: number;
  advisorId?: string;
  advisorName?: string;
}
