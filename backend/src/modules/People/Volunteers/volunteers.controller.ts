import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../../core/prisma/tenant-client.js';
import { respondError } from '../../../shared/utils/respond-error.js';
import { generateVolunteerTermoPDF } from './termo.service.js';

// Voluntário agora é só um "papel" (PersonRole.VOLUNTEER) sobre a tabela unificada Person.
const volunteerInclude = {
  supervisor: { select: { id: true, name: true } },
};

export class VolunteersController {

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const existing = await prisma.person.findFirst({ where: { document: data.cpf } });
      if (existing?.roles.includes('VOLUNTEER')) {
        res.status(400).json({ error: 'Já existe um voluntário com este CPF.' });
        return;
      }

      const birthDate = data.birthDate ? new Date(data.birthDate) : null;

      const volunteerFields = {
        profession: data.profession ?? null,
        rg: data.rg || null,
        nationality: data.nationality || null,
        maritalStatus: data.maritalStatus || null,
        services: data.services || null,
        schedule: data.schedule || null,
        skills: data.skills || [],
        availability: data.availability ?? null,
        emergencyName: data.emergencyName ?? null,
        emergencyPhone: data.emergencyPhone ?? null,
        acceptedTermsAt: data.acceptedTerms ? new Date() : null,
        supervisorId: data.supervisorId || null,
      };

      const person = existing
        ? await prisma.person.update({
            where: { id: existing.id },
            data: { roles: { set: Array.from(new Set([...existing.roles, 'VOLUNTEER'])) }, ...volunteerFields },
            include: volunteerInclude,
          })
        : await prisma.person.create({
            data: {
              kind: 'INDIVIDUAL',
              roles: ['VOLUNTEER'],
              name: data.name,
              email: data.email ?? null,
              document: data.cpf,
              phone: data.phone ?? null,
              birthDate,
              status: 'ACTIVE',
              zipCode: data.cep || null,
              street: data.address || null,
              number: data.number || null,
              neighborhood: data.neighborhood || null,
              city: data.city || null,
              state: data.state || null,
              ...volunteerFields,
            } as any, // organizationId é injetado automaticamente pelo tenantPrisma
            include: volunteerInclude,
          });

      res.status(201).json({ message: 'Voluntário cadastrado com sucesso!', volunteer: person });
    } catch (error) {
      respondError(res, error, 'Erro ao criar voluntário.');
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, availability, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = { roles: { has: 'VOLUNTEER' } };
      if (status) where.status = status;
      if (availability) where.availability = availability;
      if (search) {
        where.OR = [
          { name:       { contains: search, mode: 'insensitive' } },
          { email:      { contains: search, mode: 'insensitive' } },
          { profession: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (page) {
        const pageNum  = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip     = (pageNum - 1) * limitNum;
        const [data, total] = await Promise.all([
          prisma.person.findMany({ where, orderBy: { name: 'asc' }, skip, take: limitNum }),
          prisma.person.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const volunteers = await prisma.person.findMany({ where, orderBy: { name: 'asc' } });
      res.status(200).json(volunteers);
    } catch (error) {
      respondError(res, error, 'Erro ao listar voluntários.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const volunteer = await prisma.person.findUnique({ where: { id }, include: volunteerInclude });

      if (!volunteer) {
        res.status(404).json({ error: 'Voluntário não encontrado.' });
        return;
      }

      res.status(200).json(volunteer);
    } catch (error) {
      respondError(res, error, 'Erro ao buscar voluntário.');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any   = req.body;

      const updateData: any = {};

      const directFields = [
        'name', 'email', 'phone', 'profession',
        'skills', 'availability', 'emergencyName', 'emergencyPhone',
        'rg', 'nationality', 'maritalStatus', 'services', 'schedule',
      ];
      directFields.forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field];
      });

      if (data.cpf !== undefined) updateData.document = data.cpf;
      if (data.birthDate !== undefined) {
        updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
      }
      if (data.acceptedTerms !== undefined) {
        updateData.acceptedTermsAt = data.acceptedTerms ? new Date() : null;
      }
      if (data.supervisorId !== undefined) updateData.supervisorId = data.supervisorId || null;

      if (data.cep !== undefined) updateData.zipCode = data.cep;
      if (data.address !== undefined) updateData.street = data.address;
      if (data.number !== undefined) updateData.number = data.number;
      if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;

      const updatedVolunteer = await prisma.person.update({
        where: { id },
        data: updateData,
        include: volunteerInclude,
      });

      res.status(200).json({ message: 'Voluntário atualizado com sucesso!', volunteer: updatedVolunteer });
    } catch (error) {
      respondError(res, error, 'Erro ao atualizar voluntário.');
    }
  }

  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      await prisma.person.update({ where: { id }, data: { status: 'INACTIVE' } });
      res.status(200).json({ message: 'Voluntário inativado com sucesso.' });
    } catch (error) {
      respondError(res, error, 'Erro ao inativar voluntário.');
    }
  }

  async generateTermo(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;

      const volunteer = await prisma.person.findUnique({ where: { id }, include: volunteerInclude });

      if (!volunteer) {
        res.status(404).json({ error: 'Voluntário não encontrado.' });
        return;
      }

      const pdfBuffer = await generateVolunteerTermoPDF(volunteer);

      const safeName = volunteer.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="termo_voluntariado_${safeName}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar termo:', error);
      res.status(500).json({ error: 'Erro ao gerar o Termo de Adesão.' });
    }
  }
}
