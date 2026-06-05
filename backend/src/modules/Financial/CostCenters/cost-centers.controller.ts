import type { Request, Response } from 'express';
import prisma from '../../../config/prisma.js';

export class CostCentersController {

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { active } = req.query as Record<string, string>;
      const where: any = {};
      if (active !== undefined) where.active = active === 'true';

      const centers = await prisma.costCenter.findMany({ where, orderBy: { code: 'asc' } });
      res.json({ costCenters: centers });
    } catch (error) {
      console.error('Erro ao listar centros de custo:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const center = await prisma.costCenter.findUnique({ where: { id: req.params['id'] as string } });
      if (!center) { res.status(404).json({ error: 'Centro de custo não encontrado.' }); return; }
      res.json(center);
    } catch (error) {
      console.error('Erro ao buscar centro de custo:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name) {
        res.status(400).json({ error: 'name é obrigatório.' }); return;
      }

      // Auto-generate next sequential code: CC-01, CC-02, ...
      const last = await prisma.costCenter.findFirst({
        orderBy: { code: 'desc' },
        select:  { code: true },
      });
      let nextNum = 1;
      if (last?.code) {
        const match = last.code.match(/^CC-(\d+)$/i);
        if (match && match[1]) nextNum = parseInt(match[1], 10) + 1;
      }
      const code = `CC-${String(nextNum).padStart(2, '0')}`;

      const center = await prisma.costCenter.create({ data: { code, name, description: description ?? null } });
      res.status(201).json({ costCenter: center });
    } catch (error: any) {
      if (error.code === 'P2002') { res.status(409).json({ error: 'Código já cadastrado.' }); return; }
      console.error('Erro ao criar centro de custo:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, active } = req.body;
      const center = await prisma.costCenter.update({
        where: { id: req.params['id'] as string },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(active !== undefined && { active }),
        },
      });
      res.json({ costCenter: center });
    } catch (error: any) {
      if (error.code === 'P2025') { res.status(404).json({ error: 'Não encontrado.' }); return; }
      if (error.code === 'P2002') { res.status(409).json({ error: 'Código já cadastrado.' }); return; }
      console.error('Erro ao atualizar centro de custo:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await prisma.costCenter.update({ where: { id: req.params['id'] as string }, data: { active: false } });
      res.json({ message: 'Centro de custo desativado.' });
    } catch (error: any) {
      if (error.code === 'P2025') { res.status(404).json({ error: 'Não encontrado.' }); return; }
      console.error('Erro ao desativar centro de custo:', error);
      res.status(500).json({ error: 'Erro interno.' });
    }
  }
}
