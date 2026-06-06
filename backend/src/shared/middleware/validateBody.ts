import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';
import { AppError } from '../errors/AppError.js';

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join('; ');
      throw new AppError(400, 'VALIDATION_ERROR', message);
    }
    req.body = result.data;
    next();
  };
}
