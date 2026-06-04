import { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issues = result.error.issues ?? [];
      console.error('[validate] FAIL', req.method, req.path, '→ body:', req.body, '→ issues:', issues);

      const firstMessage = issues[0]?.message ?? 'Dados inválidos.';

      const fieldErrors: Record<string, string[]> = {};
      for (const issue of issues) {
        const key = issue.path.join('.') || '_form';
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }

      res.status(400).json({ error: firstMessage, details: fieldErrors });
      return;
    }

    req.body = result.data;
    next();
  };
}
