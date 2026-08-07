import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../../core/prisma/tenant-client.js';
import { respondError } from '../../../shared/utils/respond-error.js';

// Parceiro agora é só um "papel" (PersonRole.PARTNER) sobre a tabela unificada Person.

export class PartnersController {

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const existing = await prisma.person.findFirst({ where: { document: data.cnpj } });
      if (existing?.roles.includes('PARTNER')) {
        res.status(400).json({ error: 'Já existe um parceiro com este CNPJ.' });
        return;
      }

      const partnerFields = {
        contactName: data.contactName ?? null,
        partnershipType: data.partnershipType ?? null,
      };

      const person = existing
        ? await prisma.person.update({
            where: { id: existing.id },
            data: { roles: { set: Array.from(new Set([...existing.roles, 'PARTNER'])) }, ...partnerFields },
          })
        : await prisma.person.create({
            data: {
              kind: data.personKind === 'PF'
                ? 'INDIVIDUAL'
                : data.personKind === 'PJ'
                  ? 'COMPANY'
                  : (String(data.cnpj || '').replace(/\D/g, '').length === 11 ? 'INDIVIDUAL' : 'COMPANY'),
              roles: ['PARTNER'],
              name: data.name,
              document: data.cnpj,
              email: data.email ?? null,
              phone: data.phone ?? null,
              status: 'ACTIVE',
              zipCode: data.cep ?? null,
              street: data.address ?? null,
              number: data.number ?? null,
              neighborhood: data.neighborhood ?? null,
              city: data.city ?? null,
              state: data.state ?? null,
              ...partnerFields,
            } as any, // organizationId é injetado automaticamente pelo tenantPrisma
          });

      res.status(201).json({ message: 'Parceiro cadastrado com sucesso!', partner: person });
    } catch (error) {
      respondError(res, error, 'Erro ao criar parceiro.');
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, partnershipType, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = { roles: { has: 'PARTNER' } };
      if (status) where.status = status;
      if (partnershipType) where.partnershipType = partnershipType;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
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

      const partners = await prisma.person.findMany({ where, orderBy: { name: 'asc' } });
      res.status(200).json(partners);
    } catch (error) {
      respondError(res, error, 'Erro ao listar parceiros.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const partner = await prisma.person.findUnique({ where: { id } });

      if (!partner) {
        res.status(404).json({ error: 'Parceiro não encontrado.' });
        return;
      }

      res.status(200).json(partner);
    } catch (error) {
      respondError(res, error, 'Erro ao buscar parceiro.');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any = req.body;

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.cnpj !== undefined) updateData.document = data.cnpj;
      if (data.contactName !== undefined) updateData.contactName = data.contactName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.partnershipType !== undefined) updateData.partnershipType = data.partnershipType;
      if (data.cep !== undefined) updateData.zipCode = data.cep;
      if (data.address !== undefined) updateData.street = data.address;
      if (data.number !== undefined) updateData.number = data.number;
      if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;

      const updatedPartner = await prisma.person.update({ where: { id }, data: updateData });

      res.status(200).json({ message: 'Parceiro atualizado com sucesso!', partner: updatedPartner });
    } catch (error) {
      respondError(res, error, 'Erro ao atualizar parceiro.');
    }
  }

  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      await prisma.person.update({ where: { id }, data: { status: 'INACTIVE' } });
      res.status(200).json({ message: 'Parceiro inativado com sucesso.' });
    } catch (error) {
      respondError(res, error, 'Erro ao inativar parceiro.');
    }
  }
}
