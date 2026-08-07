import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../../config/prisma.js';
import { tenantPrisma } from '../../../core/prisma/tenant-client.js';
import { respondError } from '../../../shared/utils/respond-error.js';

// "Equipe" hoje é composta por três coisas ligadas: o User (login, plataforma),
// o Member (ficha de RH, por organização) e a Membership que liga os dois a um papel.

const generateTempPassword = (): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const rand = (str: string) => str.charAt(Math.floor(Math.random() * str.length));
  const base = rand(upper) + rand(lower) + rand(digits) + rand(lower) + rand(upper) + rand(digits);
  return 'Sigetes@' + base.split('').sort(() => Math.random() - 0.5).join('');
};

const GROUP_TO_ROLE: Record<string, string> = {
  Administrador: 'Administrador',
  Tecnologia: 'Diretor',
  Financeiro: 'Financeiro',
  Inovação: 'Projetos',
  Diretoria: 'Diretor',
  Administrativo: 'Diretor',
  Comercial: 'Comercial',
};

const MEMBER_SCALAR_FIELDS = [
  'phone', 'rg', 'nationality', 'maritalStatus',
  'pis', 'voterRegistration', 'cnpjNumber', 'bankName', 'bankAccount', 'bankAgency', 'pixKey',
  'workHours',
];
const MEMBER_BOOL_FIELDS = ['hasCnpj', 'issuesInvoice'];

async function resolveRoleId(groupOrRole: string | undefined): Promise<string> {
  const roleName = (groupOrRole && GROUP_TO_ROLE[groupOrRole]) || 'Leitor';
  const role = await tenantPrisma.role.findFirst({ where: { name: roleName } });
  if (role) return role.id;
  const fallback = await tenantPrisma.role.findFirst({ where: { name: 'Leitor' } });
  if (!fallback) throw new Error('Nenhum papel padrão encontrado para esta organização.');
  return fallback.id;
}

export class TeamController {

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const existingByEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingByEmail) {
        res.status(400).json({ error: 'Já existe um colaborador com este e-mail.' });
        return;
      }

      if (data.cpf) {
        const existingByCpf = await tenantPrisma.member.findFirst({ where: { document: data.cpf } });
        if (existingByCpf) {
          res.status(400).json({ error: 'Já existe um colaborador com este CPF.' });
          return;
        }
      }

      const temporaryPassword = generateTempPassword();
      const passwordHash = await bcrypt.hash(temporaryPassword, await bcrypt.genSalt(10));
      const roleId = await resolveRoleId(data.group || data.role);

      const user = await prisma.user.create({
        data: { name: data.name, email: data.email, passwordHash, status: 'ACTIVE' },
      });

      const member = await tenantPrisma.member.create({
        data: {
          name: data.name,
          email: data.email,
          personalEmail: data.personal_email || null,
          document: data.cpf || null,
          phone: data.phone || null,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          rg: data.rg || null,
          nationality: data.nationality || null,
          maritalStatus: data.maritalStatus || null,
          jobTitle: data.role || null,
          level: data.level || null,
          department: data.group || null,
          bondType: data.bondType || 'CLT',
          pis: data.pis || null,
          voterRegistration: data.voterRegistration || null,
          hasCnpj: data.hasCnpj ?? null,
          cnpjNumber: data.cnpjNumber || null,
          issuesInvoice: data.issuesInvoice ?? null,
          bankName: data.bankName || null,
          bankAccount: data.bankAccount || null,
          bankAgency: data.bankAgency || null,
          pixKey: data.pixKey || null,
          salary: data.salary != null ? Number(data.salary) : null,
          workDays: data.workDays || [],
          workHours: data.workHours || null,
          zipCode: data.cep || null,
          street: data.address || null,
          number: data.number || null,
          neighborhood: data.neighborhood || null,
          city: data.city || null,
          state: data.state || null,
        } as any, // organizationId é injetado automaticamente pelo tenantPrisma
      });

      await tenantPrisma.membership.create({
        data: { userId: user.id, roleId, memberId: member.id, isOwner: false } as any, // idem
      });

      res.status(201).json({ message: 'Colaborador cadastrado com sucesso!', temporaryPassword, member });
    } catch (error) {
      respondError(res, error, 'Erro ao criar colaborador.');
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name:  { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { jobTitle: { contains: search, mode: 'insensitive' } },
        ];
      }

      const select = {
        id: true, name: true, email: true, jobTitle: true, level: true, department: true,
        bondType: true, status: true,
        membership: { select: { role: { select: { name: true } } } },
      };

      if (page) {
        const pageNum  = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip     = (pageNum - 1) * limitNum;
        const [data, total] = await Promise.all([
          tenantPrisma.member.findMany({ where, select, orderBy: { name: 'asc' }, skip, take: limitNum }),
          tenantPrisma.member.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const team = await tenantPrisma.member.findMany({ where, select, orderBy: { name: 'asc' } });
      res.status(200).json(team);
    } catch (error) {
      respondError(res, error, 'Erro ao listar equipe.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;

      const member = await tenantPrisma.member.findUnique({
        where: { id },
        include: { membership: { select: { isOwner: true, role: { select: { id: true, name: true } } } } },
      });

      if (!member) {
        res.status(404).json({ error: 'Colaborador não encontrado.' });
        return;
      }

      res.status(200).json(member);
    } catch (error) {
      respondError(res, error, 'Erro ao buscar colaborador.');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data = req.body;

      const updateData: any = {};

      MEMBER_SCALAR_FIELDS.forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field] || null;
      });
      MEMBER_BOOL_FIELDS.forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field] ?? null;
      });

      if (data.name !== undefined) updateData.name = data.name;
      if (data.personal_email !== undefined) updateData.personalEmail = data.personal_email || null;
      if (data.cpf !== undefined) updateData.document = data.cpf || null;
      if (data.role !== undefined) updateData.jobTitle = data.role || null;
      if (data.level !== undefined) updateData.level = data.level || null;
      if (data.group !== undefined) updateData.department = data.group || null;
      if (data.bondType !== undefined) updateData.bondType = data.bondType;
      if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
      if (data.salary !== undefined) updateData.salary = data.salary != null ? Number(data.salary) : null;
      if (data.workDays !== undefined) updateData.workDays = data.workDays || [];

      if (data.cep !== undefined) updateData.zipCode = data.cep;
      if (data.address !== undefined) updateData.street = data.address;
      if (data.number !== undefined) updateData.number = data.number;
      if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;

      const updatedMember = await tenantPrisma.member.update({ where: { id }, data: updateData });

      // Se o grupo/papel mudou, atualiza também a Membership.
      if (data.group !== undefined || data.role !== undefined) {
        const roleId = await resolveRoleId(data.group || data.role);
        await tenantPrisma.membership.updateMany({ where: { memberId: id }, data: { roleId } });
      }

      res.status(200).json({ message: 'Dados atualizados com sucesso!', member: updatedMember });
    } catch (error) {
      respondError(res, error, 'Erro ao atualizar colaborador.');
    }
  }

  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      await tenantPrisma.member.update({ where: { id }, data: { status: 'INACTIVE' } });
      await tenantPrisma.membership.updateMany({ where: { memberId: id }, data: { status: 'INACTIVE' } });
      res.status(200).json({ message: 'Colaborador inativado com sucesso. Acesso ao sistema revogado.' });
    } catch (error) {
      respondError(res, error, 'Erro ao inativar colaborador.');
    }
  }
}
