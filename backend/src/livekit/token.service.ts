import { config } from '../config/index.js';
import { AppError } from '../shared/errors/AppError.js';

export interface LiveKitCredentials {
  token: string;
  url: string;
  roomName: string;
}

export async function createLiveKitToken(
  roomName: string,
  identity: string,
  displayName?: string,
): Promise<LiveKitCredentials> {
  const { apiKey, apiSecret, url } = config.livekit;
  if (!apiKey || !apiSecret) {
    throw new AppError(503, 'LIVEKIT_NOT_CONFIGURED', 'LiveKit API key/secret are not configured');
  }

  const { AccessToken } = await import('livekit-server-sdk');
  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name: displayName ?? identity,
  });
  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return {
    token: await token.toJwt(),
    url,
    roomName,
  };
}

export function buildConsultationRoomName(sessionId: string): string {
  return `consultation-${sessionId}`;
}

export function buildVerificationRoomName(interviewId: string): string {
  return `verification-${interviewId}`;
}
