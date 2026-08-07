import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../core/prisma/tenant-client.js';
import { respondError } from '../../shared/utils/respond-error.js';

const projectInclude = {
  manager: { select: { id: true, name: true } },
  members: { select: { role: true, member: { select: { id: true, name: true } } } },
  persons: { select: { role: true, hours: true, person: { select: { id: true, name: true, roles: true } } } },
  context: { select: { id: true, name: true, type: true, status: true } },
};

/** Monta as linhas de ProjectPerson a partir das 3 listas legadas (voluntários/doadores/parceiros). */
function buildPersonLinks(data: any) {
  return [
    ...(data.volunteerIds ?? []).map((personId: string) => ({ personId, role: 'VOLUNTEER' as const })),
    ...(data.donorIds ?? []).map((personId: string) => ({ personId, role: 'DONOR' as const })),
    ...(data.partnerIds ?? []).map((personId: string) => ({ personId, role: 'PARTNER' as const })),
  ];
}

export class ProjectsController {

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const personLinks = buildPersonLinks(data);

      const newProject = await prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          status: data.status || 'PLANNING',
          budget: data.budget ? Number(data.budget) : null,
          progress: data.progress !== undefined ? Math.min(100, Math.max(0, Number(data.progress))) : 0,
          contextId: data.contextId || null,
          ...(data.managerId && { manager: { connect: { id: data.managerId } } }),
          ...(data.teamMemberIds?.length && {
            members: { create: data.teamMemberIds.map((memberId: string) => ({ memberId })) },
          }),
          ...(personLinks.length && { persons: { create: personLinks } }),
        },
        include: projectInclude,
      });

      res.status(201).json({ message: 'Projeto criado com sucesso!', project: newProject });
    } catch (error) {
      respondError(res, error, 'Erro ao criar projeto.');
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, contextId, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = {};
      if (status) where.status = status;
      if (contextId) where.contextId = contextId;
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
        context: { select: { id: true, name: true, type: true, status: true } },
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
      respondError(res, error, 'Erro ao listar projetos.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const project = await prisma.project.findUnique({ where: { id }, include: projectInclude });

      if (!project) {
        res.status(404).json({ error: 'Projeto não encontrado.' });
        return;
      }

      res.status(200).json(project);
    } catch (error) {
      respondError(res, error, 'Erro ao buscar projeto.');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any = req.body;

      const updateData: any = {};

      ['name', 'description', 'status'].forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field];
      });
      if (data.contextId !== undefined) updateData.contextId = data.contextId || null;
      if (data.managerId !== undefined) updateData.managerId = data.managerId || null;

      if (data.budget !== undefined) updateData.budget = data.budget !== null ? Number(data.budget) : null;
      if (data.progress !== undefined) updateData.progress = Math.min(100, Math.max(0, Number(data.progress)));
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
      if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

      // Membros da equipe e pessoas vinculadas são tabelas de junção próprias
      // (ProjectMember/ProjectPerson) — substituímos o conjunto por completo.
      if (data.teamMemberIds !== undefined) {
        await prisma.projectMember.deleteMany({ where: { projectId: id } });
        if (data.teamMemberIds.length) {
          await prisma.projectMember.createMany({
            data: data.teamMemberIds.map((memberId: string) => ({ projectId: id, memberId })),
          });
        }
      }
      if (data.volunteerIds !== undefined || data.donorIds !== undefined || data.partnerIds !== undefined) {
        const rolesBeingReplaced: Array<'VOLUNTEER' | 'DONOR' | 'PARTNER'> = [
          ...(data.volunteerIds !== undefined ? (['VOLUNTEER'] as const) : []),
          ...(data.donorIds !== undefined ? (['DONOR'] as const) : []),
          ...(data.partnerIds !== undefined ? (['PARTNER'] as const) : []),
        ];
        await prisma.projectPerson.deleteMany({ where: { projectId: id, role: { in: rolesBeingReplaced } } });
        const newLinks = buildPersonLinks(data);
        if (newLinks.length) {
          await prisma.projectPerson.createMany({
            data: newLinks.map((l) => ({ projectId: id, personId: l.personId, role: l.role })),
          });
        }
      }

      const updatedProject = await prisma.project.update({ where: { id }, data: updateData, include: projectInclude });

      res.status(200).json({ message: 'Projeto atualizado com sucesso!', project: updatedProject });
    } catch (error) {
      respondError(res, error, 'Erro ao atualizar projeto.');
    }
  }

  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ error: 'O novo status é obrigatório.' });
        return;
      }

      const updatedProject = await prisma.project.update({ where: { id }, data: { status } });

      res.status(200).json({ message: `Status do projeto alterado para ${status} com sucesso!`, project: updatedProject });
    } catch (error) {
      respondError(res, error, 'Erro ao alterar status do projeto.');
    }
  }
}
