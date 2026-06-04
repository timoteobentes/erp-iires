import type { Request, Response } from 'express';
import prisma from '../../../config/prisma.js';

export class VolunteersController {
  
  // 1. CRIAR NOVO VOLUNTÁRIO (Com Nested Write do Endereço)
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const existingVolunteer = await prisma.volunteer.findUnique({
        where: { cpf: data.cpf }
      });

      if (existingVolunteer) {
        res.status(400).json({ error: 'Já existe um voluntário com este CPF.' });
        return;
      }

      // Convertendo a data se vier do frontend
      const birthDate = data.birthDate ? new Date(data.birthDate) : null;

      const newVolunteer = await prisma.volunteer.create({
        data: {
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          profession: data.profession,
          birthDate,
          skills: data.skills || [],
          availability: data.availability,
          emergencyName: data.emergencyName,
          emergencyPhone: data.emergencyPhone,
          acceptedTerms: data.acceptedTerms || false,
          status: 'active',
          
          // Magia do Prisma: Salva o endereço na tabela Address atrelado a este voluntário
          address: {
            create: {
              cep: data.cep,
              street: data.address,
              number: data.number,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
            }
          }
        },
        include: { address: true }
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
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { profession: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (page) {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;
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

  // 3. BUSCAR VOLUNTÁRIO ESPECÍFICO (JOIN com Address)
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const volunteer = await prisma.volunteer.findUnique({
        where: { id },
        include: { address: true }
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

  // 4. ATUALIZAR DADOS DO VOLUNTÁRIO (Com Upsert do Endereço)
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any = req.body;

      // Construímos o objeto de atualização dinamicamente para evitar 'undefined'
      // com a regra exactOptionalPropertyTypes: true
      const updateData: any = {};
      
      const fields = [
        'name', 'email', 'cpf', 'phone', 'profession', 
        'skills', 'availability', 'emergencyName', 'emergencyPhone'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      if (data.birthDate !== undefined) {
        updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
      }

      // Se houver algum campo de endereço, preparamos o upsert
      if (data.cep || data.address || data.number || data.neighborhood || data.city || data.state) {
        updateData.address = {
          upsert: {
            create: {
              cep: data.cep,
              street: data.address,
              number: data.number,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
            },
            update: {
              cep: data.cep,
              street: data.address,
              number: data.number,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
            }
          }
        };
      }

      const updatedVolunteer = await prisma.volunteer.update({
        where: { id },
        data: updateData,
        include: { address: true }
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
      await prisma.volunteer.update({
        where: { id },
        data: { status: 'inactive' }
      });
      res.status(200).json({ message: 'Voluntário inativado com sucesso.' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao inativar voluntário.' });
    }
  }
}