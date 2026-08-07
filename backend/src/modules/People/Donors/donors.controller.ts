import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../../core/prisma/tenant-client.js';
import { respondError } from '../../../shared/utils/respond-error.js';

// Doador agora é só um "papel" (PersonRole.DONOR) sobre a tabela unificada Person.
// A mesma pessoa pode já existir como voluntária/parceira; nesse caso o cadastro
// aqui só acrescenta o papel DONOR em vez de duplicar o registro.

export class DonorsController {

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const existing = await prisma.person.findFirst({ where: { document: data.document } });
      if (existing?.roles.includes('DONOR')) {
        res.status(400).json({ error: 'Já existe um doador com este CPF/CNPJ.' });
        return;
      }

      const donationFields = {
        donationRecurrence: data.recurrence ?? null,
        preferredPayment: data.paymentMethod ?? null,
      };

      const person = existing
        ? await prisma.person.update({
            where: { id: existing.id },
            data: { roles: { set: Array.from(new Set([...existing.roles, 'DONOR'])) }, ...donationFields },
          })
        : await prisma.person.create({
            data: {
              kind: data.type === 'PJ' ? 'COMPANY' : 'INDIVIDUAL',
              roles: ['DONOR'],
              name: data.name,
              document: data.document,
              phone: data.phone ?? null,
              email: data.email ?? null,
              status: 'ACTIVE',
              zipCode: data.cep ?? null,
              street: data.address ?? null,
              number: data.number ?? null,
              neighborhood: data.neighborhood ?? null,
              city: data.city ?? null,
              state: data.state ?? null,
              ...donationFields,
            } as any, // organizationId é injetado automaticamente pelo tenantPrisma
          });

      res.status(201).json({ message: 'Doador cadastrado com sucesso!', donor: person });
    } catch (error) {
      respondError(res, error, 'Erro ao criar doador.');
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, type, recurrence, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = { roles: { has: 'DONOR' } };
      if (status) where.status = status;
      if (type) where.kind = type === 'PJ' ? 'COMPANY' : 'INDIVIDUAL';
      if (recurrence) where.donationRecurrence = recurrence;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { document: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (page) {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;
        const [data, total] = await Promise.all([
          prisma.person.findMany({ where, orderBy: { name: 'asc' }, skip, take: limitNum }),
          prisma.person.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const donors = await prisma.person.findMany({ where, orderBy: { name: 'asc' } });
      res.status(200).json(donors);
    } catch (error) {
      respondError(res, error, 'Erro ao listar doadores.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const donor = await prisma.person.findUnique({ where: { id } });

      if (!donor) {
        res.status(404).json({ error: 'Doador não encontrado.' });
        return;
      }

      res.status(200).json(donor);
    } catch (error) {
      respondError(res, error, 'Erro ao buscar doador.');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any = req.body;

      const updateData: any = {};
      const directFields = ['name', 'document', 'phone', 'email'];
      directFields.forEach((field) => { if (data[field] !== undefined) updateData[field] = data[field]; });
      if (data.type !== undefined) updateData.kind = data.type === 'PJ' ? 'COMPANY' : 'INDIVIDUAL';
      if (data.recurrence !== undefined) updateData.donationRecurrence = data.recurrence;
      if (data.paymentMethod !== undefined) updateData.preferredPayment = data.paymentMethod;
      if (data.cep !== undefined) updateData.zipCode = data.cep;
      if (data.address !== undefined) updateData.street = data.address;
      if (data.number !== undefined) updateData.number = data.number;
      if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;

      const updatedDonor = await prisma.person.update({ where: { id }, data: updateData });

      res.status(200).json({ message: 'Doador atualizado com sucesso!', donor: updatedDonor });
    } catch (error) {
      respondError(res, error, 'Erro ao atualizar doador.');
    }
  }

  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      await prisma.person.update({ where: { id }, data: { status: 'INACTIVE' } });
      res.status(200).json({ message: 'Doador inativado com sucesso.' });
    } catch (error) {
      respondError(res, error, 'Erro ao inativar doador.');
    }
  }
}
