import { getRedis } from '../../database/redis/connection.js';

export const ONLINE_ADVISORS_KEY = 'online_advisors';
export const ADVISOR_SOCKET_KEY_PREFIX = 'advisor_socket:';

function isRedisWrongTypeError(err: unknown): boolean {
  return err instanceof Error && err.message.toUpperCase().includes('WRONGTYPE');
}

async function resetKeyIfWrongType(key: string): Promise<void> {
  try {
    await getRedis().del(key);
    console.warn(`[redis] deleted corrupt key ${key} (WRONGTYPE — recreating on next write)`);
  } catch {
    /* ignore */
  }
}

/** Returns advisor user IDs currently marked online in Redis. */
export async function getOnlineAdvisorIds(): Promise<Set<string>> {
  try {
    const redis = getRedis();
    const entries = await redis.hGetAll(ONLINE_ADVISORS_KEY);
    return new Set(Object.keys(entries));
  } catch (err) {
    if (isRedisWrongTypeError(err)) {
      await resetKeyIfWrongType(ONLINE_ADVISORS_KEY);
    } else {
      console.error('[redis] getOnlineAdvisorIds failed', err);
    }
    return new Set();
  }
}

export async function isAdvisorOnline(advisorId: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const socketId = await redis.hGet(ONLINE_ADVISORS_KEY, advisorId);
    return socketId != null && socketId.length > 0;
  } catch {
    return false;
  }
}

export async function getAdvisorSocketId(advisorId: string): Promise<string | null> {
  const redis = getRedis();
  return redis.hGet(ONLINE_ADVISORS_KEY, advisorId);
}

export async function registerAdvisorSocket(advisorId: string, socketId: string): Promise<void> {
  const redis = getRedis();
  await redis.set(`${ADVISOR_SOCKET_KEY_PREFIX}${advisorId}`, socketId);
}

export async function getRegisteredAdvisorSocketId(advisorId: string): Promise<string | null> {
  const redis = getRedis();
  return redis.get(`${ADVISOR_SOCKET_KEY_PREFIX}${advisorId}`);
}

export async function setAdvisorOnline(advisorId: string, socketId: string): Promise<void> {
  const redis = getRedis();
  await redis.hSet(ONLINE_ADVISORS_KEY, advisorId, socketId);
}

export async function setAdvisorOffline(advisorId: string): Promise<void> {
  const redis = getRedis();
  await redis.hDel(ONLINE_ADVISORS_KEY, advisorId);
}

export async function clearAdvisorSocketRegistration(advisorId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${ADVISOR_SOCKET_KEY_PREFIX}${advisorId}`);
  await redis.hDel(ONLINE_ADVISORS_KEY, advisorId);
}

export async function listOnlineAdvisorIds(): Promise<string[]> {
  const ids = await getOnlineAdvisorIds();
  return [...ids];
}
