import { randomBytes } from 'node:crypto';
import { getPool } from '../../database/postgres/connection.js';

export type SessionStatus =
  | 'pending'
  | 'ringing'
  | 'active'
  | 'completed'
  | 'declined'
  | 'cancelled';

export interface SessionRow {
  id: string;
  session_id: string;
  client_id: string;
  advisor_id: string;
  status: SessionStatus;
  coin_amount: number;
  duration_minutes: number;
  livekit_room: string | null;
  created_at: Date;
  started_at: Date | null;
  ended_at: Date | null;
}

export function generatePublicSessionId(): string {
  return randomBytes(12).toString('hex');
}

export async function createSession(input: {
  sessionId: string;
  clientId: string;
  advisorId: string;
  coinAmount: number;
  durationMinutes: number;
}): Promise<SessionRow> {
  const { rows } = await getPool().query<SessionRow>(
    `INSERT INTO sessions (session_id, client_id, advisor_id, status, coin_amount, duration_minutes)
     VALUES ($1, $2, $3, 'ringing', $4, $5)
     RETURNING *`,
    [input.sessionId, input.clientId, input.advisorId, input.coinAmount, input.durationMinutes],
  );
  return rows[0];
}

export async function findSessionByPublicId(sessionId: string): Promise<SessionRow | null> {
  const { rows } = await getPool().query<SessionRow>(
    `SELECT * FROM sessions WHERE session_id = $1`,
    [sessionId],
  );
  return rows[0] ?? null;
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  extra?: { livekitRoom?: string; startedAt?: boolean; endedAt?: boolean },
): Promise<SessionRow | null> {
  const sets = ['status = $2'];
  const params: unknown[] = [sessionId, status];
  let idx = 3;

  if (extra?.livekitRoom) {
    sets.push(`livekit_room = $${idx++}`);
    params.push(extra.livekitRoom);
  }
  if (extra?.startedAt) {
    sets.push('started_at = NOW()');
  }
  if (extra?.endedAt) {
    sets.push('ended_at = NOW()');
  }

  const { rows } = await getPool().query<SessionRow>(
    `UPDATE sessions SET ${sets.join(', ')} WHERE session_id = $1 RETURNING *`,
    params,
  );
  return rows[0] ?? null;
}
