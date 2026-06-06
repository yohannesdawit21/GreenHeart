import { getRedis } from '../../database/redis/connection.js';

export const ONLINE_ADVISORS_KEY = 'online_advisors';

/** Returns advisor user IDs currently marked online in Redis. */
export async function getOnlineAdvisorIds(): Promise<Set<string>> {
  try {
    const redis = getRedis();
    const entries = await redis.hGetAll(ONLINE_ADVISORS_KEY);
    return new Set(Object.keys(entries));
  } catch {
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
