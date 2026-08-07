import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../core/prisma/tenant-client.js';
import { respondError } from '../../shared/utils/respond-error.js';

const include = {
  user: { select: { id: true, name: true, email: true, avatarUrl: true, status: true, lastLoginAt: true } },
  role: { select: { id: true, name: true, isSystem: true } },
  member: { select: { id: true, jobTitle: true, department: true } },
};

export class MembershipsController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const memberships = await prisma.membership.findMany({
        include,
        orderBy: { createdAt: 'asc' },
      });
      res.json({ memberships });
    } catch (error) {
      respondError(res, error, 'Erro ao listar usuários da organização.');
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.body;
      if (!roleId) {
        res.status(400).json({ error: 'roleId é obrigatório.' });
        return;
      }
      const membership = await prisma.membership.update({
        where: { id: req.params['id'] as string },
        data: { roleId },
        include,
      });
      res.json({ message: 'Papel atualizado com sucesso!', membership });
    } catch (error) {
      respondError(res, error, 'Erro ao atualizar papel.');
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body as { status: 'ACTIVE' | 'INACTIVE' };
      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'status deve ser ACTIVE ou INACTIVE.' });
        return;
      }

      const target = await prisma.membership.findFirst({ where: { id: req.params['id'] as string } });
      if (!target) {
        res.status(404).json({ error: 'Vínculo não encontrado.' });
        return;
      }

      if (status === 'INACTIVE' && target.isOwner) {
        const otherActiveOwners = await prisma.membership.count({
          where: { isOwner: true, status: 'ACTIVE', id: { not: target.id } },
        });
        if (otherActiveOwners === 0) {
          res.status(409).json({ error: 'A organização precisa de pelo menos um dono ativo.' });
          return;
        }
      }

      const membership = await prisma.membership.update({
        where: { id: target.id },
        data: { status },
        include,
      });
      res.json({ message: 'Status atualizado com sucesso!', membership });
    } catch (error) {
      respondError(res, error, 'Erro ao atualizar status.');
    }
  }
}
