import type { Request, Response } from 'express';
import prisma from '../../../config/prisma.js';

export class AccountPlansController {

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { type, active } = req.query as Record<string, string>;
      const where: any = {};
      if (type) where.type = type;
      if (active !== undefined) where.active = active === 'true';

      const plans = await prisma.accountPlan.findMany({
        where,
        include: { parent: { select: { id: true, code: true, name: true } } },
        orderBy: [{ code: 'asc' }],
      });
      res.json({ accountPlans: plans });
    } catch (error) {
      console.error('Erro ao listar planos de contas:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const plan = await prisma.accountPlan.findUnique({
        where: { id: req.params['id'] as string },
        include: { parent: true, children: true },
      });
      if (!plan) { res.status(404).json({ error: 'Plano de contas não encontrado.' }); return; }
      res.json(plan);
    } catch (error) {
      console.error('Erro ao buscar plano de contas:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, type, parentId, description } = req.body;
      if (!code || !name || !type) {
        res.status(400).json({ error: 'code, name e type são obrigatórios.' }); return;
      }
      const plan = await prisma.accountPlan.create({
        data: { code, name, type, description: description ?? null, parentId: parentId || null },
      });
      res.status(201).json({ accountPlan: plan });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Código já cadastrado.' }); return;
      }
      console.error('Erro ao criar plano de contas:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, type, parentId, description, active } = req.body;
      const plan = await prisma.accountPlan.update({
        where: { id: req.params['id'] as string },
        data: {
          ...(code !== undefined && { code }),
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
          ...(description !== undefined && { description }),
          ...(active !== undefined && { active }),
          ...(parentId !== undefined && { parentId: parentId || null }),
        },
      });
      res.json({ accountPlan: plan });
    } catch (error: any) {
      if (error.code === 'P2025') { res.status(404).json({ error: 'Não encontrado.' }); return; }
      if (error.code === 'P2002') { res.status(409).json({ error: 'Código já cadastrado.' }); return; }
      console.error('Erro ao atualizar plano de contas:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await prisma.accountPlan.update({
        where: { id: req.params['id'] as string },
        data: { active: false },
      });
      res.json({ message: 'Plano de contas desativado.' });
    } catch (error: any) {
      if (error.code === 'P2025') { res.status(404).json({ error: 'Não encontrado.' }); return; }
      console.error('Erro ao desativar plano de contas:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }
}
