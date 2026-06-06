import type { InterviewOutcome, VerificationStatus } from '../../shared/types/contracts.js';
import { getPool } from '../../database/postgres/connection.js';

export interface InterviewRow {
  id: string;
  applicant_id: string;
  partner_doctor_id: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  outcome: InterviewOutcome | null;
  livekit_room: string;
  notes: string;
  created_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
}

export async function createInterview(input: {
  applicantId: string;
  partnerDoctorId: string;
  livekitRoom: string;
}): Promise<InterviewRow> {
  const { rows } = await getPool().query<InterviewRow>(
    `INSERT INTO verification_interviews (applicant_id, partner_doctor_id, status, livekit_room, started_at)
     VALUES ($1, $2, 'in_progress', $3, NOW())
     RETURNING id, applicant_id, partner_doctor_id, status, outcome, livekit_room, notes,
               created_at, started_at, completed_at`,
    [input.applicantId, input.partnerDoctorId, input.livekitRoom],
  );
  return rows[0];
}

export async function findInterviewById(id: string): Promise<InterviewRow | null> {
  const { rows } = await getPool().query<InterviewRow>(
    `SELECT id, applicant_id, partner_doctor_id, status, outcome, livekit_room, notes,
            created_at, started_at, completed_at
     FROM verification_interviews WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function completeInterview(
  id: string,
  outcome: InterviewOutcome,
  notes?: string,
): Promise<InterviewRow | null> {
  const { rows } = await getPool().query<InterviewRow>(
    `UPDATE verification_interviews
     SET status = 'completed', outcome = $2, completed_at = NOW(), notes = COALESCE($3, notes)
     WHERE id = $1 AND status != 'completed'
     RETURNING id, applicant_id, partner_doctor_id, status, outcome, livekit_room, notes,
               created_at, started_at, completed_at`,
    [id, outcome, notes ?? null],
  );
  return rows[0] ?? null;
}

export async function findInProgressInterviewForApplicant(
  applicantId: string,
): Promise<InterviewRow | null> {
  const { rows } = await getPool().query<InterviewRow>(
    `SELECT id, applicant_id, partner_doctor_id, status, outcome, livekit_room, notes,
            created_at, started_at, completed_at
     FROM verification_interviews
     WHERE applicant_id = $1 AND status = 'in_progress'
     ORDER BY created_at DESC LIMIT 1`,
    [applicantId],
  );
  return rows[0] ?? null;
}

export async function updateAdvisorVerificationStatus(
  advisorId: string,
  status: VerificationStatus,
): Promise<void> {
  await getPool().query(
    `UPDATE profiles SET verification_status = $1
     WHERE user_id = $2`,
    [status, advisorId],
  );
}
