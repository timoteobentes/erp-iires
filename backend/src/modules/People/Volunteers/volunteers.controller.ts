import type { Request, Response } from 'express';
import prisma from '../../../config/prisma.js';
import { generateVolunteerTermoPDF } from './termo.service.js';

const volunteerInclude = {
  address: true,
  supervisor: { select: { id: true, name: true } },
};

export class VolunteersController {

  // 1. CRIAR NOVO VOLUNTÁRIO
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const existing = await prisma.volunteer.findUnique({ where: { cpf: data.cpf } });
      if (existing) {
        res.status(400).json({ error: 'Já existe um voluntário com este CPF.' });
        return;
      }

      const birthDate = data.birthDate ? new Date(data.birthDate) : null;

      const newVolunteer = await prisma.volunteer.create({
        data: {
          name:          data.name,
          email:         data.email,
          cpf:           data.cpf,
          phone:         data.phone,
          profession:    data.profession,
          birthDate,
          rg:            data.rg || null,
          nationality:   data.nationality || null,
          maritalStatus: data.maritalStatus || null,
          role:          data.role  || null,
          level:         data.level || null,
          group:         data.group || null,
          services:      data.services  || null,
          schedule:      data.schedule  || null,
          workDays:      data.workDays  || [],
          workHours:     data.workHours || null,
          skills:        data.skills    || [],
          availability:  data.availability,
          emergencyName: data.emergencyName,
          emergencyPhone: data.emergencyPhone,
          acceptedTerms: data.acceptedTerms || false,
          documents:     data.documents ?? null,
          status: 'active',
          ...(data.supervisorId && {
            supervisor: { connect: { id: data.supervisorId } },
          }),
          address: {
            create: {
              cep:          data.cep          || '',
              street:       data.address      || '',
              number:       data.number       || '',
              neighborhood: data.neighborhood || '',
              city:         data.city         || '',
              state:        data.state        || '',
            },
          },
        },
        include: volunteerInclude,
      });

      res.status(201).json({ message: 'Voluntário cadastrado com sucesso!', volunteer: newVolunteer });
    } catch (error) {
      console.error('Erro no Create Volunteer:', error);
      res.status(500).json({ error: 'Erro ao criar voluntário.' });
    }
  }

  // 2. LISTAR VOLUNTÁRIOS
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, availability, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = {};
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
          prisma.volunteer.findMany({ where, orderBy: { name: 'asc' }, skip, take: limitNum }),
          prisma.volunteer.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const volunteers = await prisma.volunteer.findMany({ where, orderBy: { name: 'asc' } });
      res.status(200).json(volunteers);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar voluntários.' });
    }
  }

  // 3. BUSCAR VOLUNTÁRIO ESPECÍFICO
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const volunteer = await prisma.volunteer.findUnique({
        where: { id },
        include: volunteerInclude,
      });

      if (!volunteer) {
        res.status(404).json({ error: 'Voluntário não encontrado.' });
        return;
      }

      res.status(200).json(volunteer);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar voluntário.' });
    }
  }

  // 4. ATUALIZAR DADOS DO VOLUNTÁRIO
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any   = req.body;

      const updateData: any = {};

      const textFields = [
        'name', 'email', 'phone', 'profession',
        'skills', 'availability', 'emergencyName', 'emergencyPhone',
        'rg', 'nationality', 'maritalStatus', 'services', 'schedule',
        'role', 'level', 'group', 'workDays', 'workHours',
      ];
      textFields.forEach(field => {
        if (data[field] !== undefined) updateData[field] = data[field];
      });

      if (data.birthDate !== undefined) {
        updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
      }

      if (data.acceptedTerms !== undefined) updateData.acceptedTerms = data.acceptedTerms;
      if (data.documents    !== undefined) updateData.documents     = data.documents ?? null;

      if (data.supervisorId !== undefined) {
        updateData.supervisor = data.supervisorId
          ? { connect: { id: data.supervisorId } }
          : { disconnect: true };
      }

      if (data.cep || data.address || data.number || data.neighborhood || data.city || data.state) {
        const addrFields = {
          cep:          data.cep          || '',
          street:       data.address      || '',
          number:       data.number       || '',
          neighborhood: data.neighborhood || '',
          city:         data.city         || '',
          state:        data.state        || '',
        };
        updateData.address = { upsert: { create: addrFields, update: addrFields } };
      }

      const updatedVolunteer = await prisma.volunteer.update({
        where: { id },
        data: updateData,
        include: volunteerInclude,
      });

      res.status(200).json({ message: 'Voluntário atualizado com sucesso!', volunteer: updatedVolunteer });
    } catch (error) {
      console.error('Erro no Update Volunteer:', error);
      res.status(500).json({ error: 'Erro ao atualizar voluntário.' });
    }
  }

  // 5. INATIVAR VOLUNTÁRIO
  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      await prisma.volunteer.update({ where: { id }, data: { status: 'inactive' } });
      res.status(200).json({ message: 'Voluntário inativado com sucesso.' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao inativar voluntário.' });
    }
  }

  // 6. GERAR TERMO DE ADESÃO (PDF)
  async generateTermo(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;

      const volunteer = await prisma.volunteer.findUnique({
        where: { id },
        include: volunteerInclude,
      });

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
