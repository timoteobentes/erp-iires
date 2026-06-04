import { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0];
      res.status(400).json({
        error: firstError || 'Dados inválidos.',
        details: fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
