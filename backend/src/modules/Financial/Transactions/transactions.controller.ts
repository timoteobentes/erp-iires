import type { Request, Response } from 'express';
import prisma from '../../../config/prisma.js';

export class TransactionsController {
  
  // =========================================================
  // 1. CRIAR NOVA TRANSAÇÃO
  // =========================================================
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const newTransaction = await prisma.transaction.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type, // 'INCOME' ou 'EXPENSE'
          amount: data.amount,
          date: new Date(data.date),
          status: data.status || 'PAID',
          category: data.category,
          
          // Relacionamentos opcionais
          projectId: data.projectId || null,
          donorId: data.donorId || null,
          partnerId: data.partnerId || null,
        }
      });

      res.status(201).json({ message: 'Transação registrada com sucesso!', transaction: newTransaction });
    } catch (error) {
      console.error('Erro no Create Transaction:', error);
      res.status(500).json({ error: 'Erro ao registrar transação.' });
    }
  }

  // =========================================================
  // 2. LISTAR TRANSAÇÕES
  // =========================================================
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, type, category, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = {};
      if (status) where.status = status;
      if (type) where.type = type;
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ];
      }

      const include = {
        project: { select: { id: true, name: true } },
        donor: { select: { id: true, name: true } },
        partner: { select: { id: true, name: true } },
      };

      if (page) {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;
        const [data, total] = await Promise.all([
          prisma.transaction.findMany({ where, include, orderBy: { date: 'desc' }, skip, take: limitNum }),
          prisma.transaction.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const transactions = await prisma.transaction.findMany({ where, include, orderBy: { date: 'desc' } });
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Erro no List Transactions:', error);
      res.status(500).json({ error: 'Erro ao listar transações.' });
    }
  }

  // =========================================================
  // 3. SUMÁRIO FINANCEIRO
  // =========================================================
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const aggregations = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      });

      let totalIncome = 0;
      let totalExpense = 0;

      aggregations.forEach((group: any) => {
        if (group.type === 'INCOME') {
          totalIncome = group._sum.amount || 0;
        } else if (group.type === 'EXPENSE') {
          totalExpense = group._sum.amount || 0;
        }
      });

      res.status(200).json({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });
    } catch (error) {
      console.error('Erro no GetSummary Transaction:', error);
      res.status(500).json({ error: 'Erro ao obter sumário financeiro.' });
    }
  }

  // =========================================================
  // 4. BUSCAR TRANSAÇÃO ESPECÍFICA
  // =========================================================
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          project: { select: { id: true, name: true } },
          donor: { select: { id: true, name: true } },
          partner: { select: { id: true, name: true } }
        }
      });

      if (!transaction) {
        res.status(404).json({ error: 'Transação não encontrada.' });
        return;
      }

      res.status(200).json(transaction);
    } catch (error) {
      console.error('Erro no GetById Transaction:', error);
      res.status(500).json({ error: 'Erro ao buscar transação.' });
    }
  }

  // =========================================================
  // 5. ATUALIZAR TRANSAÇÃO
  // =========================================================
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      const data: any = req.body;

      // Construímos o objeto de atualização dinamicamente para evitar undefined
      const updateData: any = {};
      
      const fields = [
        'title', 'description', 'type', 'amount', 'status', 'category',
        'projectId', 'donorId', 'partnerId'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      if (data.date !== undefined) {
        updateData.date = new Date(data.date);
      }
      
      // Permitir setar null nos relacionamentos se enviado null explícito no body
      if (data.projectId === null) updateData.projectId = null;
      if (data.donorId === null) updateData.donorId = null;
      if (data.partnerId === null) updateData.partnerId = null;

      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: updateData,
        include: {
          project: { select: { id: true, name: true } },
          donor: { select: { id: true, name: true } },
          partner: { select: { id: true, name: true } }
        }
      });

      res.status(200).json({ message: 'Transação atualizada com sucesso!', transaction: updatedTransaction });
    } catch (error) {
      console.error('Erro no Update Transaction:', error);
      res.status(500).json({ error: 'Erro ao atualizar transação.' });
    }
  }

  // =========================================================
  // 6. SUMÁRIO MENSAL (últimos 6 meses)
  // =========================================================
  async getMonthlySummary(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const monthsData = [];

      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const label = start.toLocaleString('pt-BR', { month: 'short' });

        const aggs = await prisma.transaction.groupBy({
          by: ['type'],
          where: {
            date: { gte: start, lte: end },
            status: { not: 'CANCELED' },
          },
          _sum: { amount: true },
        });

        let income = 0;
        let expense = 0;
        aggs.forEach((a: any) => {
          if (a.type === 'INCOME') income = a._sum.amount || 0;
          if (a.type === 'EXPENSE') expense = a._sum.amount || 0;
        });

        monthsData.push({ month: label, income, expense });
      }

      res.status(200).json(monthsData);
    } catch (error) {
      console.error('Erro no GetMonthlySummary Transaction:', error);
      res.status(500).json({ error: 'Erro ao obter sumário mensal.' });
    }
  }

  // =========================================================
  // 7. DELETAR / CANCELAR TRANSAÇÃO
  // =========================================================
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id }: any = req.params;
      
      // Optamos por cancelar em vez de deletar fisicamente
      await prisma.transaction.update({
        where: { id },
        data: { status: 'CANCELED' }
      });
      
      res.status(200).json({ message: 'Transação cancelada com sucesso.' });
    } catch (error) {
      console.error('Erro no Delete Transaction:', error);
      res.status(500).json({ error: 'Erro ao cancelar transação.' });
    }
  }
}
