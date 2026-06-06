import type { NextFunction, Request, Response } from 'express';
import { reindexAdvisor, semanticSearch } from './search.service.js';

export async function postSemanticSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const { query, limit } = req.body as { query?: string; limit?: number };
    const result = await semanticSearch(query ?? '', limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function postReindexAdvisor(req: Request, res: Response, next: NextFunction) {
  try {
    const advisorId = req.params.advisorId as string;
    const result = await reindexAdvisor(advisorId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
