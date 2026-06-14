import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../../config/prisma.js';

const generateTempPassword = (): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const rand = (str: string) => str.charAt(Math.floor(Math.random() * str.length));
  const base = rand(upper) + rand(lower) + rand(digits) + rand(lower) + rand(upper) + rand(digits);
  return 'IIRes@' + base.split('').sort(() => Math.random() - 0.5).join('');
};

const SCALAR_FIELDS = [
  'name', 'phone', 'rg', 'nationality', 'maritalStatus', 'role', 'level', 'group', 'bondType',
  'pis', 'voterRegistration', 'cnpjNumber', 'bankName', 'bankAccount', 'bankAgency', 'pixKey',
  'workHours',
];

const BOOL_FIELDS = ['hasCnpj', 'issuesInvoice'];

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
        const existingByCpf = await prisma.user.findFirst({ where: { cpf: data.cpf } });
        if (existingByCpf) {
          res.status(400).json({ error: 'Já existe um colaborador com este CPF.' });
          return;
        }
      }

      const temporaryPassword = generateTempPassword();
      const passwordHash = await bcrypt.hash(temporaryPassword, await bcrypt.genSalt(10));

      const hasAddress = !!(data.address?.trim());

      const newMember = await prisma.user.create({
        data: {
          name:          data.name,
          email:         data.email,
          personalEmail: data.personal_email || null,
          cpf:           data.cpf   || null,
          phone:         data.phone || null,
          birthDate:     data.birthDate ? new Date(data.birthDate) : null,
          rg:            data.rg           || null,
          nationality:   data.nationality  || null,
          maritalStatus: data.maritalStatus || null,
          role:          data.role  || null,
          level:         data.level || null,
          group:         data.group || null,
          bondType:      data.bondType || 'CLT',
          // Financeiro / contrato
          pis:              data.pis              || null,
          voterRegistration:data.voterRegistration|| null,
          hasCnpj:          data.hasCnpj          ?? null,
          cnpjNumber:       data.cnpjNumber       || null,
          issuesInvoice:    data.issuesInvoice     ?? null,
          bankName:         data.bankName         || null,
          bankAccount:      data.bankAccount      || null,
          bankAgency:       data.bankAgency       || null,
          pixKey:           data.pixKey           || null,
          salary:           data.salary != null ? Number(data.salary) : null,
          workDays:         data.workDays         || [],
          workHours:        data.workHours        || null,
          documents:        data.documents        ?? null,
          passwordHash,
          ...(hasAddress && {
            address: {
              create: {
                cep:          data.cep          || '',
                street:       data.address,
                number:       data.number       || '',
                neighborhood: data.neighborhood || '',
                city:         data.city         || '',
                state:        data.state        || '',
              }
            }
          }),
        },
        include: { address: true }
      });

      res.status(201).json({ message: 'Colaborador cadastrado com sucesso!', temporaryPassword, member: newMember });
    } catch (error) {
      console.error('Erro no Create Team:', error);
      res.status(500).json({ error: 'Erro ao criar colaborador.' });
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
          { role:  { contains: search, mode: 'insensitive' } },
        ];
      }

      const select = { id: true, name: true, email: true, role: true, level: true, group: true, bondType: true, status: true };

      if (page) {
        const pageNum  = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip     = (pageNum - 1) * limitNum;
        const [data, total] = await Promise.all([
          prisma.user.findMany({ where, select, orderBy: { name: 'asc' }, skip, take: limitNum }),
          prisma.user.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const team = await prisma.user.findMany({ where, select, orderBy: { name: 'asc' } });
      res.status(200).json(team);
    } catch (error) {
      console.error('Erro no List Team:', error);
      res.status(500).json({ error: 'Erro ao listar equipe.' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;

      const member = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true, name: true, email: true, personalEmail: true,
          cpf: true, phone: true, birthDate: true, rg: true, nationality: true, maritalStatus: true,
          role: true, level: true, group: true, bondType: true, status: true, createdAt: true,
          pis: true, voterRegistration: true, hasCnpj: true, cnpjNumber: true, issuesInvoice: true,
          bankName: true, bankAccount: true, bankAgency: true, pixKey: true, salary: true,
          workDays: true, workHours: true, documents: true,
          address: true,
        }
      });

      if (!member) {
        res.status(404).json({ error: 'Colaborador não encontrado.' });
        return;
      }

      res.status(200).json(member);
    } catch (error) {
      console.error('Erro no GetById Team:', error);
      res.status(500).json({ error: 'Erro ao buscar colaborador.' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data = req.body;

      const updateData: any = {};

      SCALAR_FIELDS.forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field] || null;
      });

      BOOL_FIELDS.forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field] ?? null;
      });

      if (data.personal_email !== undefined) updateData.personalEmail = data.personal_email || null;
      if (data.cpf       !== undefined) updateData.cpf       = data.cpf || null;
      if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
      if (data.salary    !== undefined) updateData.salary    = data.salary != null ? Number(data.salary) : null;
      if (data.workDays  !== undefined) updateData.workDays  = data.workDays || [];
      if (data.documents !== undefined) updateData.documents = data.documents ?? null;

      const hasAddress = !!(data.address?.trim());
      if (hasAddress) {
        const addrFields = {
          cep: data.cep || '', street: data.address, number: data.number || '',
          neighborhood: data.neighborhood || '', city: data.city || '', state: data.state || '',
        };
        updateData.address = { upsert: { create: addrFields, update: addrFields } };
      }

      const updatedMember = await prisma.user.update({
        where: { id },
        data: updateData,
        include: { address: true }
      });

      res.status(200).json({ message: 'Dados atualizados com sucesso!', member: updatedMember });
    } catch (error) {
      console.error('Erro no Update Team:', error);
      res.status(500).json({ error: 'Erro ao atualizar colaborador.' });
    }
  }

  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      await prisma.user.update({ where: { id }, data: { status: 'inactive' } });
      res.status(200).json({ message: 'Colaborador inativado com sucesso. Acesso ao sistema revogado.' });
    } catch (error) {
      console.error('Erro no Inactivate Team:', error);
      res.status(500).json({ error: 'Erro ao inativar colaborador.' });
    }
  }
}
