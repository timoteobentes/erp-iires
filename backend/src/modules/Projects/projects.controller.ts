import type { Request, Response } from 'express';
import prisma from '../../config/prisma.js';

const projectInclude = {
  manager:     { select: { id: true, name: true } },
  teamMembers: { select: { id: true, name: true } },
  volunteers:  { select: { id: true, name: true } },
  partners:    { select: { id: true, name: true, partnershipType: true } },
  donors:      { select: { id: true, name: true } },
};

export class ProjectsController {

  // =========================================================
  // 1. CRIAR NOVO PROJETO
  // =========================================================
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const newProject = await prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          status: data.status || 'planning',
          budget: data.budget ? Number(data.budget) : null,
          progress: data.progress !== undefined ? Math.min(100, Math.max(0, Number(data.progress))) : 0,

          manager: { connect: { id: data.managerId } },

          ...(data.teamMemberIds?.length && {
            teamMembers: { connect: data.teamMemberIds.map((id: string) => ({ id })) }
          }),
          ...(data.volunteerIds?.length && {
            volunteers: { connect: data.volunteerIds.map((id: string) => ({ id })) }
          }),
          ...(data.partnerIds?.length && {
            partners: { connect: data.partnerIds.map((id: string) => ({ id })) }
          }),
          ...(data.donorIds?.length && {
            donors: { connect: data.donorIds.map((id: string) => ({ id })) }
          }),
        },
        include: projectInclude,
      });

      res.status(201).json({ message: 'Projeto criado com sucesso!', project: newProject });
    } catch (error) {
      console.error('Erro no Create Project:', error);
      res.status(500).json({ error: 'Erro ao criar projeto.' });
    }
  }

  // =========================================================
  // 2. LISTAR PROJETOS
  // =========================================================
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const select = {
        id: true, name: true, description: true, startDate: true, endDate: true, status: true,
        budget: true, progress: true,
        manager: { select: { id: true, name: true } },
      };

      if (page) {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;
        const [data, total] = await Promise.all([
          prisma.project.findMany({ where, select, orderBy: { name: 'asc' }, skip, take: limitNum }),
          prisma.project.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const projects = await prisma.project.findMany({ where, select, orderBy: { name: 'asc' } });
      res.status(200).json(projects);
    } catch (error) {
      console.error('Erro no List Projects:', error);
      res.status(500).json({ error: 'Erro ao listar projetos.' });
    }
  }

  // =========================================================
  // 3. BUSCAR PROJETO ESPECÍFICO
  // =========================================================
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const project = await prisma.project.findUnique({
        where: { id },
        include: projectInclude,
      });

      if (!project) {
        res.status(404).json({ error: 'Projeto não encontrado.' });
        return;
      }

      res.status(200).json(project);
    } catch (error) {
      console.error('Erro no GetById Project:', error);
      res.status(500).json({ error: 'Erro ao buscar projeto.' });
    }
  }

  // =========================================================
  // 4. ATUALIZAR DADOS DO PROJETO
  // =========================================================
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any = req.body;

      const updateData: any = {};

      ['name', 'description', 'status', 'managerId'].forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field];
      });

      if (data.budget !== undefined) updateData.budget = data.budget !== null ? Number(data.budget) : null;
      if (data.progress !== undefined) updateData.progress = Math.min(100, Math.max(0, Number(data.progress)));
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
      if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

      if (data.teamMemberIds !== undefined) {
        updateData.teamMembers = { set: data.teamMemberIds.map((id: string) => ({ id })) };
      }
      if (data.volunteerIds !== undefined) {
        updateData.volunteers = { set: data.volunteerIds.map((id: string) => ({ id })) };
      }
      if (data.partnerIds !== undefined) {
        updateData.partners = { set: data.partnerIds.map((id: string) => ({ id })) };
      }
      if (data.donorIds !== undefined) {
        updateData.donors = { set: data.donorIds.map((id: string) => ({ id })) };
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: updateData,
        include: projectInclude,
      });

      res.status(200).json({ message: 'Projeto atualizado com sucesso!', project: updatedProject });
    } catch (error) {
      console.error('Erro no Update Project:', error);
      res.status(500).json({ error: 'Erro ao atualizar projeto.' });
    }
  }

  // =========================================================
  // 5. MUDAR STATUS DO PROJETO
  // =========================================================
  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ error: 'O novo status é obrigatório.' });
        return;
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: { status }
      });

      res.status(200).json({ message: `Status do projeto alterado para ${status} com sucesso!`, project: updatedProject });
    } catch (error) {
      console.error('Erro no Change Status Project:', error);
      res.status(500).json({ error: 'Erro ao alterar status do projeto.' });
    }
  }
}
