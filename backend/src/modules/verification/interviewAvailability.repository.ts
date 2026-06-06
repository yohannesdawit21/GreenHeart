import { getRedis } from '../../database/redis/connection.js';

export const INTERVIEW_AVAILABLE_KEY = 'interview_available_applicants';

export async function setInterviewAvailable(applicantId: string): Promise<void> {
  const redis = getRedis();
  await redis.hSet(INTERVIEW_AVAILABLE_KEY, applicantId, '1');
}

export async function setInterviewUnavailable(applicantId: string): Promise<void> {
  const redis = getRedis();
  await redis.hDel(INTERVIEW_AVAILABLE_KEY, applicantId);
}

export async function isInterviewAvailable(applicantId: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const value = await redis.hGet(INTERVIEW_AVAILABLE_KEY, applicantId);
    return value != null && value.length > 0;
  } catch {
    return false;
  }
}

export async function listInterviewAvailableIds(): Promise<Set<string>> {
  try {
    const redis = getRedis();
    const entries = await redis.hGetAll(INTERVIEW_AVAILABLE_KEY);
    return new Set(Object.keys(entries));
  } catch {
    return new Set();
  }
}
