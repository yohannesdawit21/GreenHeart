import type { Server, Socket } from 'socket.io';
import {
  clearAdvisorSocketRegistration,
  registerAdvisorSocket,
  removeAdvisorFromLiveList,
} from '../modules/presence/presence.repository.js';
import { restoreAdvisorPresenceIfIntended } from '../modules/presence/presence.service.js';
import { setInterviewUnavailable } from '../modules/verification/interviewAvailability.repository.js';
import { acceptSession, declineSession } from '../modules/sessions/sessions.service.js';
import { getSocketAuth } from './auth.middleware.js';

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    const auth = getSocketAuth(socket);
    socket.join(`user:${auth.userId}`);

    if (auth.role === 'advisor') {
      void registerAdvisorSocket(auth.userId, socket.id).then(() =>
        restoreAdvisorPresenceIfIntended(auth.userId),
      );
    }

    socket.on('call_accepted', async (payload: { sessionId?: string }) => {
      try {
        if (!payload?.sessionId) return;
        if (auth.role !== 'advisor') return;
        await acceptSession(auth.userId, payload.sessionId);
      } catch (err) {
        console.error('[socket] call_accepted error', err);
        socket.emit('call_processing', {
          sessionId: payload?.sessionId ?? '',
          status: 'ringing',
        });
      }
    });

    socket.on('call_declined', async (payload: { sessionId?: string; reason?: string }) => {
      try {
        if (!payload?.sessionId) return;
        if (auth.role !== 'advisor') return;
        await declineSession(auth.userId, payload.sessionId, payload.reason);
      } catch (err) {
        console.error('[socket] call_declined error', err);
      }
    });

    socket.on('presence_ping', async (payload: { advisorId?: string; online?: boolean }) => {
      try {
        if (auth.role !== 'advisor') return;
        if (payload?.advisorId && payload.advisorId !== auth.userId) return;
        await registerAdvisorSocket(auth.userId, socket.id);
      } catch (err) {
        console.error('[socket] presence_ping error', err);
      }
    });

    socket.on('disconnect', () => {
      if (auth.role === 'advisor') {
        void clearAdvisorSocketRegistration(auth.userId);
        void removeAdvisorFromLiveList(auth.userId);
        void setInterviewUnavailable(auth.userId);
      }
    });
  });
}
