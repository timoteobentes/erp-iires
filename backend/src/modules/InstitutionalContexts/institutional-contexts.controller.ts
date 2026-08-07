import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../core/prisma/tenant-client.js';
import { respondError } from '../../shared/utils/respond-error.js';

const include = {
  responsible: { select: { id: true, name: true, email: true } },
  _count: { select: { projects: true, transactions: true, persons: true } },
};

export class InstitutionalContextsController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, type, status } = req.query as Record<string, string>;
      const where: any = {};
      if (type) where.type = type;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const contexts = await prisma.institutionalContext.findMany({
        where,
        include,
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
      });
      res.json(contexts);
    } catch (error) {
      respondError(res, error, 'Erro ao listar contextos institucionais.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const context = await prisma.institutionalContext.findUnique({
        where: { id: req.params['id'] as string },
        include: {
          ...include,
          projects: { select: { id: true, name: true, status: true }, orderBy: { name: 'asc' } },
        },
      });
      if (!context) {
        res.status(404).json({ error: 'Contexto institucional não encontrado.' });
        return;
      }
      res.json(context);
    } catch (error) {
      respondError(res, error, 'Erro ao buscar contexto institucional.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const context = await prisma.institutionalContext.create({
        data: {
          ...data,
          responsibleId: data.responsibleId || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
        include,
      });
      res.status(201).json({ message: 'Contexto institucional criado com sucesso.', context });
    } catch (error) {
      respondError(res, error, 'Erro ao criar contexto institucional.');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const data = { ...req.body };
      if ('startDate' in data) data.startDate = data.startDate ? new Date(data.startDate) : null;
      if ('endDate' in data) data.endDate = data.endDate ? new Date(data.endDate) : null;
      if ('responsibleId' in data) data.responsibleId = data.responsibleId || null;

      const context = await prisma.institutionalContext.update({
        where: { id: req.params['id'] as string },
        data,
        include,
      });
      res.json({ message: 'Contexto institucional atualizado com sucesso.', context });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        res.status(404).json({ error: 'Contexto institucional não encontrado.' });
        return;
      }
      respondError(res, error, 'Erro ao atualizar contexto institucional.');
    }
  }

  async archive(req: Request, res: Response): Promise<void> {
    try {
      const context = await prisma.institutionalContext.update({
        where: { id: req.params['id'] as string },
        data: { status: 'ARCHIVED' },
        include,
      });
      res.json({ message: 'Contexto institucional arquivado.', context });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        res.status(404).json({ error: 'Contexto institucional não encontrado.' });
        return;
      }
      respondError(res, error, 'Erro ao arquivar contexto institucional.');
    }
  }
}

