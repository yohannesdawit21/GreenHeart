import { getPool } from '../../database/postgres/connection.js';
import { AppError } from '../../shared/errors/AppError.js';

/** Returns null when column missing (pre-M6) or no row. */
export async function getAdvisorVerificationStatus(advisorId: string): Promise<string | null> {
  try {
    const { rows } = await getPool().query<{ verification_status: string | null }>(
      `SELECT verification_status FROM profiles WHERE user_id = $1`,
      [advisorId],
    );
    return rows[0]?.verification_status ?? null;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === '42703') return null;
    throw err;
  }
}

export async function assertAdvisorCanServe(advisorId: string): Promise<void> {
  const status = await getAdvisorVerificationStatus(advisorId);
  if (status != null && status !== 'verified') {
    throw new AppError(403, 'ADVISOR_NOT_VERIFIED', 'Advisor is not verified');
  }
}
