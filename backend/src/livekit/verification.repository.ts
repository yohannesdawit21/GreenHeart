import { getPool } from '../database/postgres/connection.js';
import { AppError } from '../shared/errors/AppError.js';

export interface VerificationInterviewRow {
  id: string;
  applicantId: string;
  partnerDoctorId: string;
  status: string;
  livekitRoom: string | null;
}

function mapRow(row: {
  id: string;
  applicant_id: string;
  partner_doctor_id: string;
  status: string;
  livekit_room: string | null;
}): VerificationInterviewRow {
  return {
    id: row.id,
    applicantId: row.applicant_id,
    partnerDoctorId: row.partner_doctor_id,
    status: row.status,
    livekitRoom: row.livekit_room,
  };
}

export async function findVerificationInterviewById(
  interviewId: string,
): Promise<VerificationInterviewRow | null> {
  try {
    const { rows } = await getPool().query<{
      id: string;
      applicant_id: string;
      partner_doctor_id: string;
      status: string;
      livekit_room: string | null;
    }>(
      `SELECT id, applicant_id, partner_doctor_id, status, livekit_room
       FROM verification_interviews
       WHERE id = $1`,
      [interviewId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === '42P01') {
      throw new AppError(
        503,
        'VERIFICATION_NOT_READY',
        'Verification schema not migrated — run npm run db:migrate (004)',
      );
    }
    throw err;
  }
}
