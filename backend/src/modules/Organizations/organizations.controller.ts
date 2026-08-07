import type { Request, Response } from 'express';
import prisma from '../../config/prisma.js';
import { respondError } from '../../shared/utils/respond-error.js';

// Organization é a raiz do tenant (não tem organizationId) — por isso usa o
// Prisma "cru", sempre restringindo manualmente pelo id da própria organização
// do usuário logado (nunca aceita um id vindo do cliente).

// storageUsedBytes é BigInt no banco — JSON.stringify não serializa BigInt,
// então convertemos para string antes de responder.
function serializeOrganization(organization: Record<string, unknown>) {
  return { ...organization, storageUsedBytes: String(organization['storageUsedBytes'] ?? 0) };
}

export class OrganizationsController {
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id: req.user!.organizationId },
      });
      if (!organization) {
        res.status(404).json({ error: 'Organização não encontrada.' });
        return;
      }
      res.json({ organization: serializeOrganization(organization) });
    } catch (error) {
      respondError(res, error, 'Erro ao buscar dados da organização.');
    }
  }

  async updateMe(req: Request, res: Response): Promise<void> {
    try {
      const organization = await prisma.organization.update({
        where: { id: req.user!.organizationId },
        data: req.body,
      });
      res.json({ message: 'Organização atualizada com sucesso!', organization: serializeOrganization(organization) });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Já existe outra organização com esses dados.' });
        return;
      }
      respondError(res, error, 'Erro ao atualizar organização.');
    }
  }
}
