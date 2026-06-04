import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../../config/prisma.js';

// Gera uma senha temporária aleatória com pelo menos 1 maiúscula, 1 número e 1 símbolo
const generateTempPassword = (): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const rand = (str: string) => str.charAt(Math.floor(Math.random() * str.length));

  // Garante ao menos 1 de cada grupo
  const base =
    rand(upper) +
    rand(lower) +
    rand(digits) +
    rand(lower) +
    rand(upper) +
    rand(digits);

  // Embaralha
  return 'IIRes@' + base.split('').sort(() => Math.random() - 0.5).join('');
};

export class TeamController {

  // =========================================================
  // 1. CRIAR NOVO MEMBRO DA EQUIPE
  // =========================================================
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      // Verifica se o e-mail já existe
      const existingByEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingByEmail) {
        res.status(400).json({ error: 'Já existe um colaborador com este e-mail.' });
        return;
      }

      // Verifica CPF apenas se for fornecido
      if (data.cpf) {
        const existingByCpf = await prisma.user.findFirst({ where: { cpf: data.cpf } });
        if (existingByCpf) {
          res.status(400).json({ error: 'Já existe um colaborador com este CPF.' });
          return;
        }
      }

      // Senha temporária aleatória
      const temporaryPassword = generateTempPassword();
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(temporaryPassword, salt);

      // Só cria o endereço se o campo de logradouro foi preenchido
      const hasAddress = !!(data.address?.trim());

      const newMember = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          personalEmail: data.personal_email || null,
          cpf: data.cpf || null,
          phone: data.phone || null,
          role: data.role || null,
          level: data.level || null,
          group: data.group || null,
          passwordHash,
          ...(hasAddress && {
            address: {
              create: {
                cep: data.cep || '',
                street: data.address,
                number: data.number || '',
                neighborhood: data.neighborhood || '',
                city: data.city || '',
                state: data.state || '',
              }
            }
          }),
        },
        include: { address: true }
      });

      res.status(201).json({
        message: 'Colaborador cadastrado com sucesso!',
        temporaryPassword, // retornado UMA VEZ para exibição ao admin
        member: newMember
      });
    } catch (error) {
      console.error('Erro no Create Team:', error);
      res.status(500).json({ error: 'Erro ao criar colaborador.' });
    }
  }

  // =========================================================
  // 2. LISTAR TODA A EQUIPE
  // =========================================================
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } },
        ];
      }

      const select = { id: true, name: true, email: true, role: true, level: true, group: true, status: true };

      if (page) {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;
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

  // =========================================================
  // 3. BUSCAR UM MEMBRO ESPECÍFICO
  // =========================================================
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;

      const member = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          personalEmail: true,
          cpf: true,
          phone: true,
          role: true,
          level: true,
          group: true,
          status: true,
          createdAt: true,
          address: true
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

  // =========================================================
  // 4. ATUALIZAR DADOS DO MEMBRO
  // =========================================================
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data = req.body;

      const updateData: any = {};

      const fields = ['name', 'email', 'phone', 'role', 'level', 'group'];
      fields.forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field] || null;
      });

      if (data.personal_email !== undefined) updateData.personalEmail = data.personal_email || null;
      if (data.cpf !== undefined) updateData.cpf = data.cpf || null;

      // Atualiza endereço somente se logradouro for fornecido
      const hasAddress = !!(data.address?.trim());
      if (hasAddress) {
        updateData.address = {
          upsert: {
            create: {
              cep: data.cep || '',
              street: data.address,
              number: data.number || '',
              neighborhood: data.neighborhood || '',
              city: data.city || '',
              state: data.state || '',
            },
            update: {
              cep: data.cep || '',
              street: data.address,
              number: data.number || '',
              neighborhood: data.neighborhood || '',
              city: data.city || '',
              state: data.state || '',
            }
          }
        };
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

  // =========================================================
  // 5. INATIVAR MEMBRO (Soft Delete)
  // =========================================================
  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;

      await prisma.user.update({
        where: { id },
        data: { status: 'inactive' }
      });

      res.status(200).json({ message: 'Colaborador inativado com sucesso. Acesso ao sistema revogado.' });
    } catch (error) {
      console.error('Erro no Inactivate Team:', error);
      res.status(500).json({ error: 'Erro ao inativar colaborador.' });
    }
  }
}
