import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { findVerificationInterviewById } from './verification.repository.js';
import { createVerificationParticipantToken } from './verification.service.js';

const ACTIVE_STATUSES = new Set(['scheduled', 'in_progress']);

export async function getVerificationLiveKitToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const interviewId = req.params.id as string;
    const userId = req.auth!.userId;

    const interview = await findVerificationInterviewById(interviewId);
    if (!interview) {
      throw new AppError(404, 'NOT_FOUND', 'Interview not found');
    }

    if (userId !== interview.applicantId && userId !== interview.partnerDoctorId) {
      throw new AppError(403, 'FORBIDDEN', 'Not a participant in this interview');
    }

    if (!ACTIVE_STATUSES.has(interview.status)) {
      throw new AppError(409, 'VALIDATION_ERROR', `Interview is ${interview.status}`);
    }

    const displayName =
      userId === interview.partnerDoctorId ? 'Partner Doctor' : 'Applicant';

    const creds = await createVerificationParticipantToken({
      interviewId: interview.id,
      userId,
      displayName,
    });

    res.json({
      token: creds.token,
      livekitUrl: creds.url,
      roomName: creds.roomName,
    });
  } catch (err) {
    next(err);
  }
}
