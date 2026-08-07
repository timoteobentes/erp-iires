import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../core/prisma/tenant-client.js';
import { respondError } from '../../shared/utils/respond-error.js';

export class RolesController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
      res.json({ roles });
    } catch (error) {
      respondError(res, error, 'Erro ao listar papéis.');
    }
  }
}
