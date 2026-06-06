import { AppError } from '../../shared/errors/AppError.js';
import type { AuthPayload } from '../../shared/middleware/auth.middleware.js';
import { assertAdvisorCanServe } from '../sessions/advisorEligibility.js';
import {
  getRegisteredAdvisorSocketId,
  listOnlineAdvisorIds,
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
    await setAdvisorOnline(auth.userId, socketId);
  } else {
    await setAdvisorOffline(auth.userId);
  }

  return { advisorId: auth.userId, online };
}

export async function getOnlineAdvisors() {
  const advisorIds = await listOnlineAdvisorIds();
  return { advisorIds };
}
