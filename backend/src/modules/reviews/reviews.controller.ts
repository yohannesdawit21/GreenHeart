import type { NextFunction, Request, Response } from 'express';
import * as reviewsService from './reviews.service.js';

export async function postReview(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewsService.submitReview(req.auth!.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAdvisorReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const advisorId = String(req.params.advisorId);
    const result = await reviewsService.getAdvisorReviews(advisorId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMyReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewsService.getClientReviews(req.auth!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
