import { AppError } from '../../shared/errors/AppError.js';
import type { AuthPayload } from '../../shared/middleware/auth.middleware.js';
import { assertAdvisorCanServe } from '../sessions/advisorEligibility.js';
import {
  getRegisteredAdvisorSocketId,
  isAdvisorIntendedOnline,
  isAdvisorOnline,
  listOnlineAdvisorIds,
  setAdvisorIntendedOnline,
  setAdvisorOffline,
  setAdvisorOnline,
} from './presence.repository.js';

export async function updatePresenceStatus(auth: AuthPayload, online: boolean) {
  if (auth.role !== 'advisor') {
    throw new AppError(403, 'FORBIDDEN', 'Only advisors can update presence');
  }

  await assertAdvisorCanServe(auth.userId);

  if (online) {
    const socketId = await getRegisteredAdvisorSocketId(auth.userId);
    if (!socketId) {
      throw new AppError(
        409,
        'SOCKET_NOT_CONNECTED',
        'Connect to the realtime socket before going online',
      );
    }
    await setAdvisorIntendedOnline(auth.userId, true);
    await setAdvisorOnline(auth.userId, socketId);
  } else {
    await setAdvisorIntendedOnline(auth.userId, false);
    await setAdvisorOffline(auth.userId);
  }

  return { advisorId: auth.userId, online };
}

export async function getOnlineAdvisors() {
  const advisorIds = await listOnlineAdvisorIds();
  return { advisorIds };
}

export async function getAdvisorPresenceStatus(auth: AuthPayload) {
  if (auth.role !== 'advisor') {
    throw new AppError(403, 'FORBIDDEN', 'Only advisors can read their presence status');
  }

  const [live, intended, socketConnected] = await Promise.all([
    isAdvisorOnline(auth.userId),
    isAdvisorIntendedOnline(auth.userId),
    getRegisteredAdvisorSocketId(auth.userId).then((id) => Boolean(id)),
  ]);

  return {
    advisorId: auth.userId,
    online: live,
    intendedOnline: intended,
    socketConnected,
  };
}

export async function restoreAdvisorPresenceIfIntended(advisorId: string): Promise<void> {
  const intended = await isAdvisorIntendedOnline(advisorId);
  if (!intended) return;

  const socketId = await getRegisteredAdvisorSocketId(advisorId);
  if (socketId) {
    await setAdvisorOnline(advisorId, socketId);
  }
}
