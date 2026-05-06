import type { Request, Response } from 'express';
import prisma from '../../../config/prisma.js';

export class DonorsController {
  
  // =========================================================
  // 1. CRIAR NOVO DOADOR (Com Nested Write do Endereço)
  // =========================================================
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const existingDonor = await prisma.donor.findUnique({
        where: { document: data.document }
      });

      if (existingDonor) {
        res.status(400).json({ error: 'Já existe um doador com este CPF/CNPJ.' });
        return;
      }

      const newDonor = await prisma.donor.create({
        data: {
          type: data.type,
          name: data.name,
          document: data.document,
          phone: data.phone,
          email: data.email,
          recurrence: data.recurrence,
          paymentMethod: data.paymentMethod,
          status: 'active',
          
          // Magia do Prisma: Salva o endereço na tabela Address atrelado a este doador
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

      res.status(201).json({ message: 'Doador cadastrado com sucesso!', donor: newDonor });
    } catch (error) {
      console.error('Erro no Create Donor:', error);
      res.status(500).json({ error: 'Erro ao criar doador.' });
    }
  }

  // =========================================================
  // 2. LISTAR DOADORES
  // =========================================================
  async list(req: Request, res: Response): Promise<void> {
    try {
      const donors = await prisma.donor.findMany({
        orderBy: { name: 'asc' }
      });
      res.status(200).json(donors);
    } catch (error) {
      console.error('Erro no List Donors:', error);
      res.status(500).json({ error: 'Erro ao listar doadores.' });
    }
  }

  // =========================================================
  // 3. BUSCAR DOADOR ESPECÍFICO (JOIN com Address)
  // =========================================================
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const donor = await prisma.donor.findUnique({
        where: { id },
        include: { address: true }
      });

      if (!donor) {
        res.status(404).json({ error: 'Doador não encontrado.' });
        return;
      }

      res.status(200).json(donor);
    } catch (error) {
      console.error('Erro no GetById Donor:', error);
      res.status(500).json({ error: 'Erro ao buscar doador.' });
    }
  }

  // =========================================================
  // 4. ATUALIZAR DADOS DO DOADOR (Com Upsert do Endereço)
  // =========================================================
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any = req.body;

      // Construímos o objeto de atualização dinamicamente para evitar 'undefined'
      // com a regra exactOptionalPropertyTypes: true
      const updateData: any = {};
      
      const fields = [
        'type', 'name', 'document', 'phone', 'email', 'recurrence', 'paymentMethod'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

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

      const updatedDonor = await prisma.donor.update({
        where: { id },
        data: updateData,
        include: { address: true }
      });

      res.status(200).json({ message: 'Doador atualizado com sucesso!', donor: updatedDonor });
    } catch (error) {
      console.error('Erro no Update Donor:', error);
      res.status(500).json({ error: 'Erro ao atualizar doador.' });
    }
  }

  // =========================================================
  // 5. INATIVAR DOADOR
  // =========================================================
  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      await prisma.donor.update({
        where: { id },
        data: { status: 'inactive' }
      });
      res.status(200).json({ message: 'Doador inativado com sucesso.' });
    } catch (error) {
      console.error('Erro no Inactivate Donor:', error);
      res.status(500).json({ error: 'Erro ao inativar doador.' });
    }
  }
}
