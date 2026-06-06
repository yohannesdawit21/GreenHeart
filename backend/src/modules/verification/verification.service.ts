import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { config } from '../../config/index.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { InterviewOutcome, VerificationStatus } from '../../shared/types/contracts.js';
import { getIO, isUserSocketConnected } from '../../socket/index.js';
import { toApplicantDto, toPartnerDoctorDto } from '../users/users.mapper.js';
import * as usersRepo from '../users/users.repository.js';
import { getRegisteredAdvisorSocketId } from '../presence/presence.repository.js';
import * as interviewAvailabilityRepo from './interviewAvailability.repository.js';
import * as verificationRepo from './verification.repository.js';

const BCRYPT_ROUNDS = 10;

async function triggerReindex(advisorId: string): Promise<void> {
  try {
    const base = `http://127.0.0.1:${config.port}`;
    await fetch(`${base}/api/search/reindex/${advisorId}`, { method: 'POST' });
  } catch {
    // M4 may not be implemented yet — non-fatal
  }
}

async function notifyApplicantInterviewStarted(
  applicantId: string,
  interviewId: string,
  partnerDoctorId: string,
): Promise<void> {
  const io = getIO();
  if (!io) return;

  const partner = await usersRepo.findUserById(partnerDoctorId);
  io.to(`user:${applicantId}`).emit('verification_interview_started', {
    interviewId,
    partnerName: partner?.username ?? 'Partner Doctor',
  });
}

export async function listApplicants() {
  const rows = await usersRepo.listPendingApplicants();
  const availableIds = await interviewAvailabilityRepo.listInterviewAvailableIds();
  return rows.map((row) => ({
    ...toApplicantDto(row),
    isOnline: availableIds.has(row.id),
  }));
}

export async function getInterviewAvailability(applicantId: string) {
  const available = await interviewAvailabilityRepo.isInterviewAvailable(applicantId);
  return { available };
}

export async function updateInterviewAvailability(applicantId: string, available: boolean) {
  const applicant = await usersRepo.findUserById(applicantId);
  if (!applicant || applicant.role !== 'advisor') {
    throw new AppError(403, 'FORBIDDEN', 'Only advisors can update interview availability');
  }
  if (applicant.verification_status !== 'pending_review') {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Interview availability applies to pending applicants only',
    );
  }

  if (available) {
    const socketId = await getRegisteredAdvisorSocketId(applicantId);
    if (!socketId || !isUserSocketConnected(applicantId)) {
      throw new AppError(
        409,
        'SOCKET_NOT_CONNECTED',
        'Connect to the realtime server before opening for interviews',
      );
    }
    await interviewAvailabilityRepo.setInterviewAvailable(applicantId);
  } else {
    await interviewAvailabilityRepo.setInterviewUnavailable(applicantId);
  }

  return { available };
}

export async function startInterview(partnerDoctorId: string, applicantId: string) {
  const applicant = await usersRepo.findUserById(applicantId);
  if (!applicant || applicant.role !== 'advisor') {
    throw new AppError(404, 'VALIDATION_ERROR', 'Applicant not found');
  }
  if (applicant.verification_status !== 'pending_review') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Applicant is not pending review');
  }

  const applicantOnline = await interviewAvailabilityRepo.isInterviewAvailable(applicantId);
  if (!applicantOnline) {
    throw new AppError(
      400,
      'APPLICANT_NOT_AVAILABLE',
      'Applicant is not open for verification interviews',
    );
  }

  const existing = await verificationRepo.findInProgressInterviewForApplicant(applicantId);
  if (existing) {
    await notifyApplicantInterviewStarted(applicantId, existing.id, partnerDoctorId);
    return {
      interviewId: existing.id,
      livekitRoom: existing.livekit_room,
      applicantOnline,
      applicantUsername: applicant.username,
    };
  }

  const livekitRoom = `verification-${randomUUID()}`;
  const interview = await verificationRepo.createInterview({
    applicantId,
    partnerDoctorId,
    livekitRoom,
  });

  await notifyApplicantInterviewStarted(applicantId, interview.id, partnerDoctorId);

  return {
    interviewId: interview.id,
    livekitRoom: interview.livekit_room,
    applicantOnline,
    applicantUsername: applicant.username,
  };
}

export async function acceptInterview(applicantId: string, interviewId: string) {
  const interview = await verificationRepo.findInterviewById(interviewId);
  if (!interview) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Interview not found');
  }
  if (interview.applicant_id !== applicantId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your interview');
  }
  if (interview.status !== 'in_progress') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Interview is not active');
  }

  const applicant = await usersRepo.findUserById(applicantId);
  const io = getIO();
  io?.to(`user:${interview.partner_doctor_id}`).emit('verification_interview_accepted', {
    interviewId,
    applicantName: applicant?.username ?? 'Applicant',
  });

  return { interviewId, ok: true as const };
}

export async function declineInterview(applicantId: string, interviewId: string) {
  const interview = await verificationRepo.findInterviewById(interviewId);
  if (!interview) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Interview not found');
  }
  if (interview.applicant_id !== applicantId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your interview');
  }
  if (interview.status !== 'in_progress') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Interview is not active');
  }

  const applicant = await usersRepo.findUserById(applicantId);
  const io = getIO();
  io?.to(`user:${interview.partner_doctor_id}`).emit('verification_interview_declined', {
    interviewId,
    applicantName: applicant?.username ?? 'Applicant',
  });

  return { interviewId, ok: true as const };
}

export async function getMyActiveInterview(applicantId: string) {
  const interview = await verificationRepo.findInProgressInterviewForApplicant(applicantId);
  if (!interview) {
    return { interviewId: null as string | null };
  }

  const partner = await usersRepo.findUserById(interview.partner_doctor_id);
  return {
    interviewId: interview.id,
    partnerName: partner?.username ?? 'Partner Doctor',
  };
}

export async function completeInterview(
  partnerDoctorId: string,
  interviewId: string,
  outcome: InterviewOutcome,
  notes?: string,
) {
  const interview = await verificationRepo.findInterviewById(interviewId);
  if (!interview) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Interview not found');
  }
  if (interview.partner_doctor_id !== partnerDoctorId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your interview');
  }
  if (interview.status === 'completed') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Interview already completed');
  }

  const completed = await verificationRepo.completeInterview(interviewId, outcome, notes);
  if (!completed) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Could not complete interview');
  }

  const newStatus: VerificationStatus = outcome === 'pass' ? 'verified' : 'rejected';
  await verificationRepo.updateAdvisorVerificationStatus(completed.applicant_id, newStatus);
  await interviewAvailabilityRepo.setInterviewUnavailable(completed.applicant_id);

  if (outcome === 'pass') {
    await triggerReindex(completed.applicant_id);
  }

  const io = getIO();
  const completedPayload = {
    interviewId,
    outcome,
    verificationStatus: newStatus,
  };
  io?.to(`user:${completed.applicant_id}`).emit('verification_interview_completed', completedPayload);
  io?.to(`user:${partnerDoctorId}`).emit('verification_interview_completed', completedPayload);

  return {
    applicantId: completed.applicant_id,
    verificationStatus: newStatus,
  };
}

export async function getInterviewForTokenRequest(userId: string, interviewId: string) {
  const interview = await verificationRepo.findInterviewById(interviewId);
  if (!interview) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Interview not found');
  }
  const isParticipant =
    interview.applicant_id === userId || interview.partner_doctor_id === userId;
  if (!isParticipant) {
    throw new AppError(403, 'FORBIDDEN', 'Not a participant in this interview');
  }
  return interview;
}

export async function createPartnerDoctor(input: {
  email: string;
  password: string;
  username: string;
}) {
  const existing = await usersRepo.findUserByEmail(input.email);
  if (existing) {
    throw new AppError(409, 'VALIDATION_ERROR', 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await usersRepo.createUserWithProfileAndWallet({
    email: input.email,
    passwordHash,
    role: 'partner_doctor',
    username: input.username,
    bio: '',
    tags: [],
    coinRatePerSession: 0,
    verificationStatus: null,
  });

  return toPartnerDoctorDto({
    id: user.id,
    email: user.email,
    username: user.username,
    bio: user.bio,
    tags: user.tags,
    coin_rate_per_session: user.coin_rate_per_session,
    verification_status: user.verification_status ?? 'pending_review',
    created_at: user.created_at,
  });
}

export async function listPartnerDoctors() {
  const rows = await usersRepo.listPartnerDoctors();
  return rows.map(toPartnerDoctorDto);
}

export async function updatePartnerDoctor(
  partnerId: string,
  input: { email?: string; username?: string; password?: string },
) {
  const existing = await usersRepo.findUserById(partnerId);
  if (!existing || existing.role !== 'partner_doctor') {
    throw new AppError(404, 'VALIDATION_ERROR', 'Partner doctor not found');
  }

  if (input.email && input.email.toLowerCase() !== existing.email.toLowerCase()) {
    const emailTaken = await usersRepo.findUserByEmail(input.email);
    if (emailTaken) {
      throw new AppError(409, 'VALIDATION_ERROR', 'Email already registered');
    }
  }

  let passwordHash: string | undefined;
  if (input.password) {
    passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  const updated = await usersRepo.updatePartnerDoctor(partnerId, {
    email: input.email,
    username: input.username,
    passwordHash,
  });
  if (!updated) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Partner doctor not found');
  }

  return toPartnerDoctorDto({
    id: updated.id,
    email: updated.email,
    username: updated.username,
    bio: updated.bio,
    tags: updated.tags,
    coin_rate_per_session: updated.coin_rate_per_session,
    verification_status: updated.verification_status ?? 'pending_review',
    created_at: updated.created_at,
  });
}

export async function deletePartnerDoctor(partnerId: string) {
  const existing = await usersRepo.findUserById(partnerId);
  if (!existing || existing.role !== 'partner_doctor') {
    throw new AppError(404, 'VALIDATION_ERROR', 'Partner doctor not found');
  }

  const deleted = await usersRepo.deletePartnerDoctor(partnerId);
  if (!deleted) {
    throw new AppError(404, 'VALIDATION_ERROR', 'Partner doctor not found');
  }

  return { id: partnerId, deleted: true as const };
}

export async function listAllAdvisorsForAdmin() {
  const rows = await usersRepo.listAllAdvisors();
  return rows.map(toApplicantDto);
}

export async function overrideAdvisorVerificationStatus(advisorId: string, status: VerificationStatus) {
  const advisor = await usersRepo.findUserById(advisorId);
  if (!advisor || advisor.role !== 'advisor') {
    throw new AppError(404, 'VALIDATION_ERROR', 'Advisor not found');
  }

  await verificationRepo.updateAdvisorVerificationStatus(advisorId, status);

  if (status === 'verified') {
    await triggerReindex(advisorId);
  }

  const updated = await usersRepo.findUserById(advisorId);
  return {
    advisorId,
    verificationStatus: updated?.verification_status ?? status,
  };
}
