import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../../config/prisma.js';

export class TeamController {
  
  // =========================================================
  // 1. CRIAR NOVO MEMBRO DA EQUIPE (Com Nested Write)
  // =========================================================
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      // Verifica se o email ou CPF já existem
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { cpf: data.cpf }
          ]
        }
      });

      if (existingUser) {
        res.status(400).json({ error: 'Já existe um colaborador com este E-mail ou CPF.' });
        return;
      }

      // Gera senha padrão "Mudar@123"
      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash('Mudar@123', salt);

      // A MÁGICA: Cria o Usuário e o Endereço simultaneamente!
      const newMember = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          personalEmail: data.personal_email,
          cpf: data.cpf,
          phone: data.phone,
          role: data.role,
          level: data.level,
          group: data.group,
          passwordHash: defaultPasswordHash,
          // Relação 1-para-1 com a tabela Address
          address: {
            create: {
              cep: data.cep,
              street: data.address, // Mapeia o 'address' do Front para o 'street' do Back
              number: data.number,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
            }
          }
        },
        // Retorna o usuário já com os dados do endereço embutidos
        include: { address: true }
      });

      res.status(201).json({ 
        message: 'Colaborador cadastrado com sucesso! Senha padrão: Mudar@123', 
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
      // Para listagem geral, não precisamos carregar o endereço inteiro (ganho de performance)
      const team = await prisma.user.findMany({
        select: {
          id: true, 
          name: true, 
          email: true, 
          role: true, 
          level: true, 
          group: true, 
          status: true
        },
        orderBy: { name: 'asc' }
      });
      
      res.status(200).json(team);
    } catch (error) {
      console.error('Erro no List Team:', error);
      res.status(500).json({ error: 'Erro ao listar equipe.' });
    }
  }

  // =========================================================
  // 3. BUSCAR UM MEMBRO ESPECÍFICO (Com JOIN de Endereço)
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
          // O Prisma faz o JOIN automático e traz o objeto address!
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
  // 4. ATUALIZAR DADOS DO MEMBRO (Com UPSERT de Endereço)
  // =========================================================
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data = req.body;

      const updatedMember = await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          personalEmail: data.personal_email,
          cpf: data.cpf,
          phone: data.phone,
          role: data.role,
          level: data.level,
          group: data.group,
          // UPSERT: Atualiza se existir, Cria se não existir!
          address: {
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
          }
        },
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

      // Altera apenas o status, mantendo histórico de auditoria
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