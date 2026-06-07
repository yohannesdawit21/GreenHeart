import { findUserById } from '../users/users.repository.js';
import { lockEscrow, refundEscrow, releaseEscrow } from '../wallet/wallet.service.js';
import { getAdvisorSocketId } from '../presence/presence.repository.js';
import { getIO } from '../../socket/index.js';
import { AppError } from '../../shared/errors/AppError.js';
import { buildConsultationRoomName, createLiveKitToken } from '../../livekit/token.service.js';
import { assertAdvisorCanServe } from './advisorEligibility.js';
import { isAdvisorOnline } from '../presence/presence.repository.js';
import {
  createSession,
  findSessionByPublicId,
  generatePublicSessionId,
  updateSessionStatus,
  type SessionRow,
} from './sessions.repository.js';

const DEFAULT_DURATION_MINUTES = 30;

async function getClientDisplayName(clientId: string): Promise<string> {
  const user = await findUserById(clientId);
  return user?.username ?? 'Client';
}

export async function initiateSession(clientId: string, advisorId: string) {
  await assertAdvisorCanServe(advisorId);

  if (!(await isAdvisorOnline(advisorId))) {
    throw new AppError(409, 'ADVISOR_OFFLINE', 'Advisor is not online');
  }

  const advisor = await findUserById(advisorId);
  if (!advisor || advisor.role !== 'advisor') {
    throw new AppError(404, 'NOT_FOUND', 'Advisor not found');
  }

  const coinAmount = advisor.coin_rate_per_session;
  if (coinAmount <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Advisor has no session rate configured');
  }

  const sessionId = generatePublicSessionId();
  const locked = await lockEscrow(clientId, coinAmount, sessionId);
  if (!locked) {
    throw new AppError(402, 'INSUFFICIENT_FUNDS', 'Insufficient coin balance');
  }

  let session: SessionRow;
  try {
    session = await createSession({
      sessionId,
      clientId,
      advisorId,
      coinAmount,
      durationMinutes: DEFAULT_DURATION_MINUTES,
    });
  } catch (err) {
    await refundEscrow(clientId, coinAmount);
    throw err;
  }

  const io = getIO();
  const advisorSocketId = await getAdvisorSocketId(advisorId);
  const clientName = await getClientDisplayName(clientId);

  if (io && advisorSocketId) {
    io.to(advisorSocketId).emit('incoming_call_dispatch', {
      sessionId: session.session_id,
      clientName,
      durationMinutes: session.duration_minutes,
    });
  }

  io?.to(`user:${clientId}`).emit('call_processing', {
    sessionId: session.session_id,
    status: 'ringing',
  });

  return {
    sessionId: session.session_id,
    status: session.status,
    coinAmount: session.coin_amount,
    durationMinutes: session.duration_minutes,
  };
}

export async function acceptSession(advisorId: string, sessionId: string) {
  const session = await findSessionByPublicId(sessionId);
  if (!session) {
    throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }
  if (session.advisor_id !== advisorId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your session');
  }
  if (session.status !== 'ringing') {
    throw new AppError(409, 'VALIDATION_ERROR', `Cannot accept session in status ${session.status}`);
  }

  const roomName = buildConsultationRoomName(session.session_id);
  const updated = await updateSessionStatus(session.session_id, 'active', {
    livekitRoom: roomName,
    startedAt: true,
  });
  if (!updated) {
    throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }

  const [clientCreds, advisorCreds] = await Promise.all([
    createLiveKitToken(roomName, session.client_id, 'Client'),
    createLiveKitToken(roomName, session.advisor_id, 'Advisor'),
  ]);

  const io = getIO();
  io?.to(`user:${session.client_id}`).emit('session_ready', {
    sessionId: session.session_id,
    livekitToken: clientCreds.token,
    livekitUrl: clientCreds.url,
    roomName: clientCreds.roomName,
  });
  io?.to(`user:${session.advisor_id}`).emit('session_ready', {
    sessionId: session.session_id,
    livekitToken: advisorCreds.token,
    livekitUrl: advisorCreds.url,
    roomName: advisorCreds.roomName,
  });

  return { sessionId: session.session_id, status: updated.status };
}

export async function declineSession(advisorId: string, sessionId: string, _reason?: string) {
  const session = await findSessionByPublicId(sessionId);
  if (!session) {
    throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }
  if (session.advisor_id !== advisorId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your session');
  }
  if (session.status !== 'ringing') {
    throw new AppError(409, 'VALIDATION_ERROR', `Cannot decline session in status ${session.status}`);
  }

  await refundEscrow(session.client_id, session.coin_amount);
  const updated = await updateSessionStatus(session.session_id, 'declined', { endedAt: true });

  const io = getIO();
  io?.to(`user:${session.client_id}`).emit('call_processing', {
    sessionId: session.session_id,
    status: 'declined',
  });

  return { sessionId: session.session_id, status: updated?.status ?? 'declined' };
}

export async function endSession(userId: string, sessionId: string) {
  const session = await findSessionByPublicId(sessionId);
  if (!session) {
    throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }
  if (session.client_id !== userId && session.advisor_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not a participant in this session');
  }
  if (session.status === 'completed' || session.status === 'declined' || session.status === 'cancelled') {
    return { sessionId: session.session_id, status: session.status };
  }

  if (session.status === 'ringing') {
    await refundEscrow(session.client_id, session.coin_amount);
    const updated = await updateSessionStatus(session.session_id, 'cancelled', { endedAt: true });

    const io = getIO();
    io?.to(`user:${session.advisor_id}`).emit('call_processing', {
      sessionId: session.session_id,
      status: 'cancelled',
    });
    io?.to(`user:${session.client_id}`).emit('call_processing', {
      sessionId: session.session_id,
      status: 'cancelled',
    });

    return { sessionId: session.session_id, status: updated?.status ?? 'cancelled' };
  }

  if (session.status === 'active') {
    await releaseEscrow(session.client_id, session.advisor_id, session.coin_amount);
    const updated = await updateSessionStatus(session.session_id, 'completed', { endedAt: true });
    return { sessionId: session.session_id, status: updated?.status ?? 'completed' };
  }

  throw new AppError(409, 'VALIDATION_ERROR', `Cannot end session in status ${session.status}`);
}

export async function getLiveKitTokenForSession(userId: string, sessionId: string) {
  const session = await findSessionByPublicId(sessionId);
  if (!session) {
    throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }
  if (session.client_id !== userId && session.advisor_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not a participant in this session');
  }
  if (session.status !== 'active' || !session.livekit_room) {
    throw new AppError(409, 'VALIDATION_ERROR', 'Session is not active');
  }

  const displayName = userId === session.client_id ? 'Client' : 'Advisor';
  const creds = await createLiveKitToken(session.livekit_room, userId, displayName);
  return creds;
}

export async function getSessionStatus(userId: string, sessionId: string) {
  const session = await findSessionByPublicId(sessionId);
  if (!session) {
    throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
  }
  if (session.client_id !== userId && session.advisor_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not a participant in this session');
  }
  const advisor = await findUserById(session.advisor_id);
  return {
    sessionId: session.session_id,
    status: session.status,
    coinAmount: session.coin_amount,
    durationMinutes: session.duration_minutes,
    advisorId: session.advisor_id,
    advisorName: advisor?.username ?? 'Advisor',
  };
}
