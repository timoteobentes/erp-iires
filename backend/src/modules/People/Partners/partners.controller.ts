import type { Request, Response } from 'express';
import prisma from '../../../config/prisma.js';

export class PartnersController {
  
  // =========================================================
  // 1. CRIAR NOVO PARCEIRO (Com Nested Write do Endereço)
  // =========================================================
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const existingPartner = await prisma.partner.findUnique({
        where: { cnpj: data.cnpj }
      });

      if (existingPartner) {
        res.status(400).json({ error: 'Já existe um parceiro com este CNPJ.' });
        return;
      }

      const newPartner = await prisma.partner.create({
        data: {
          name: data.name,
          cnpj: data.cnpj,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          partnershipType: data.partnershipType,
          status: 'active',
          
          // Magia do Prisma: Salva o endereço na tabela Address atrelado a este parceiro
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

      res.status(201).json({ message: 'Parceiro cadastrado com sucesso!', partner: newPartner });
    } catch (error) {
      console.error('Erro no Create Partner:', error);
      res.status(500).json({ error: 'Erro ao criar parceiro.' });
    }
  }

  // =========================================================
  // 2. LISTAR PARCEIROS
  // =========================================================
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, partnershipType, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = {};
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
          prisma.partner.findMany({ where, orderBy: { name: 'asc' }, skip, take: limitNum }),
          prisma.partner.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const partners = await prisma.partner.findMany({ where, orderBy: { name: 'asc' } });
      res.status(200).json(partners);
    } catch (error) {
      console.error('Erro no List Partners:', error);
      res.status(500).json({ error: 'Erro ao listar parceiros.' });
    }
  }

  // =========================================================
  // 3. BUSCAR PARCEIRO ESPECÍFICO (JOIN com Address)
  // =========================================================
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const partner = await prisma.partner.findUnique({
        where: { id },
        include: { address: true }
      });

      if (!partner) {
        res.status(404).json({ error: 'Parceiro não encontrado.' });
        return;
      }

      res.status(200).json(partner);
    } catch (error) {
      console.error('Erro no GetById Partner:', error);
      res.status(500).json({ error: 'Erro ao buscar parceiro.' });
    }
  }

  // =========================================================
  // 4. ATUALIZAR DADOS DO PARCEIRO (Com Upsert do Endereço)
  // =========================================================
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any = req.body;

      // Construímos o objeto de atualização dinamicamente para evitar 'undefined'
      // com a regra exactOptionalPropertyTypes: true
      const updateData: any = {};
      
      const fields = [
        'name', 'cnpj', 'contactName', 'email', 'phone', 'partnershipType'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      // Se houver algum campo de endereço, preparamos o addressData para não enviar undefined
      if (
        data.cep !== undefined || 
        data.address !== undefined || 
        data.number !== undefined || 
        data.neighborhood !== undefined || 
        data.city !== undefined || 
        data.state !== undefined
      ) {
        
        const addressData: any = {};
        
        if (data.cep !== undefined) addressData.cep = data.cep;
        if (data.address !== undefined) addressData.street = data.address;
        if (data.number !== undefined) addressData.number = data.number;
        if (data.neighborhood !== undefined) addressData.neighborhood = data.neighborhood;
        if (data.city !== undefined) addressData.city = data.city;
        if (data.state !== undefined) addressData.state = data.state;
        
        updateData.address = {
          upsert: {
            create: {
              cep: data.cep ?? '',
              street: data.address ?? '',
              number: data.number ?? '',
              neighborhood: data.neighborhood ?? '',
              city: data.city ?? '',
              state: data.state ?? ''
            },
            update: addressData
          }
        };
      }

      const updatedPartner = await prisma.partner.update({
        where: { id },
        data: updateData,
        include: { address: true }
      });

      res.status(200).json({ message: 'Parceiro atualizado com sucesso!', partner: updatedPartner });
    } catch (error) {
      console.error('Erro no Update Partner:', error);
      res.status(500).json({ error: 'Erro ao atualizar parceiro.' });
    }
  }

  // =========================================================
  // 5. INATIVAR PARCEIRO
  // =========================================================
  async inactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      await prisma.partner.update({
        where: { id },
        data: { status: 'inactive' }
      });
      res.status(200).json({ message: 'Parceiro inativado com sucesso.' });
    } catch (error) {
      console.error('Erro no Inactivate Partner:', error);
      res.status(500).json({ error: 'Erro ao inativar parceiro.' });
    }
  }
}
