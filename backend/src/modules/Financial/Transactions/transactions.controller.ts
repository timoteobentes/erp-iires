import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { tenantPrisma as prisma } from '../../../core/prisma/tenant-client.js';
import { respondError } from '../../../shared/utils/respond-error.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function advanceDate(date: Date, frequency: string, steps: number): Date {
  const d = new Date(date);
  switch (frequency) {
    case 'WEEKLY':    d.setDate(d.getDate() + 7 * steps); break;
    case 'MONTHLY':   d.setMonth(d.getMonth() + steps); break;
    case 'QUARTERLY': d.setMonth(d.getMonth() + 3 * steps); break;
    case 'ANNUALLY':  d.setFullYear(d.getFullYear() + steps); break;
  }
  return d;
}

const COMMON_INCLUDE = {
  project:     { select: { id: true, name: true } },
  person:      { select: { id: true, name: true, roles: true } },
  accountPlan: { select: { id: true, code: true, name: true } },
  costCenter:  { select: { id: true, code: true, name: true } },
  context:     { select: { id: true, name: true, type: true, status: true } },
};

// ─── controller ───────────────────────────────────────────────────────────────

export class TransactionsController {

  // =========================================================
  // 1. CRIAR TRANSAÇÃO ÚNICA
  // =========================================================
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      // organizationId é injetado automaticamente pelo tenantPrisma — ver core/prisma/tenant-client.ts.
      const newTransaction = await prisma.transaction.create({
        data: {
          title:        data.title,
          description:  data.description ?? null,
          type:         data.type,
          amount:       data.amount,
          date:         new Date(data.date),
          status:       data.status || 'PENDING',
          category:     data.category ?? null,
          paymentMethod: data.paymentMethod ?? null,
          observations:  data.observations ?? null,
          accountPlanId: data.accountPlanId || null,
          costCenterId:  data.costCenterId  || null,
          projectId:     data.projectId     || null,
          personId:      data.personId      || null,
          contextId:     data.contextId     || null,
        } as any,
        include: COMMON_INCLUDE,
      });

      res.status(201).json({ message: 'Transação registrada com sucesso!', transaction: newTransaction });
    } catch (error) {
      respondError(res, error, 'Erro ao registrar transação.');
    }
  }

  // =========================================================
  // 2. CRIAR EM LOTE (parcelamento ou recorrência)
  // =========================================================
  async createBatch(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const groupId = randomUUID();

      const baseFields = {
        type:         data.type,
        status:       data.status || 'PENDING',
        category:     data.category ?? null,
        description:  data.description ?? null,
        paymentMethod: data.paymentMethod ?? null,
        observations:  data.observations ?? null,
        accountPlanId: data.accountPlanId || null,
        costCenterId:  data.costCenterId  || null,
        projectId:     data.projectId     || null,
        personId:      data.personId      || null,
        contextId:     data.contextId     || null,
        groupId,
      };

      const firstDate = new Date(data.firstDate);
      const records: any[] = [];

      if (data.groupType === 'INSTALLMENT') {
        const total: number  = data.installmentTotal;
        const amount: number = Number((data.totalAmount / total).toFixed(2));
        const remainder = Number((data.totalAmount - amount * total).toFixed(2));

        for (let i = 0; i < total; i++) {
          records.push({
            ...baseFields,
            title:             `${data.title} - Parcela ${i + 1}/${total}`,
            amount:            i === 0 ? amount + remainder : amount,
            date:              advanceDate(firstDate, 'MONTHLY', i),
            groupType:         'INSTALLMENT',
            installmentNumber: i + 1,
            installmentTotal:  total,
          });
        }

      } else if (data.groupType === 'RECURRING') {
        const freq: string    = data.recurrenceFrequency;
        const endDate: Date   = data.recurrenceEndDate
          ? new Date(data.recurrenceEndDate)
          : advanceDate(firstDate, 'MONTHLY', 12);
        const amount: number  = data.amount;

        let step = 0;
        let cur  = new Date(firstDate);
        while (cur <= endDate) {
          records.push({
            ...baseFields,
            title:              data.title,
            amount,
            date:               new Date(cur),
            groupType:          'RECURRING',
            recurrenceFrequency: freq,
            recurrenceEndDate:  endDate,
          });
          step++;
          cur = advanceDate(firstDate, freq, step);
        }

      } else {
        res.status(400).json({ error: 'groupType deve ser INSTALLMENT ou RECURRING.' });
        return;
      }

      await prisma.transaction.createMany({ data: records });

      const created = await prisma.transaction.findMany({
        where: { groupId },
        include: COMMON_INCLUDE,
        orderBy: { date: 'asc' },
      });

      res.status(201).json({ message: 'Lançamentos criados com sucesso!', transactions: created, groupId });
    } catch (error) {
      respondError(res, error, 'Erro ao criar lançamentos em lote.');
    }
  }

  // =========================================================
  // 3. LISTAR TRANSAÇÕES
  // =========================================================
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, type, category, contextId, page, limit = '50' } = req.query as Record<string, string>;

      const where: any = {};
      if (status)   where.status   = status;
      if (type)     where.type     = type;
      if (category) where.category = category;
      if (contextId) where.contextId = contextId;
      if (search) {
        where.OR = [
          { title:       { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category:    { contains: search, mode: 'insensitive' } },
        ];
      }

      if (page) {
        const pageNum  = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const skip     = (pageNum - 1) * limitNum;
        const [data, total] = await Promise.all([
          prisma.transaction.findMany({ where, include: COMMON_INCLUDE, orderBy: { date: 'desc' }, skip, take: limitNum }),
          prisma.transaction.count({ where }),
        ]);
        res.status(200).json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
        return;
      }

      const transactions = await prisma.transaction.findMany({ where, include: COMMON_INCLUDE, orderBy: { date: 'desc' } });
      res.status(200).json(transactions);
    } catch (error) {
      respondError(res, error, 'Erro ao listar transações.');
    }
  }

  // =========================================================
  // 4. SUMÁRIO FINANCEIRO
  // =========================================================
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const contextId = req.query['contextId'] as string | undefined;
      const aggregations = await prisma.transaction.groupBy({
        by: ['type'],
        where: { status: 'PAID', ...(contextId ? { contextId } : {}) },
        _sum: { amount: true },
      });

      let totalIncome  = 0;
      let totalExpense = 0;
      aggregations.forEach((g: any) => {
        if (g.type === 'INCOME')  totalIncome  = g._sum.amount || 0;
        if (g.type === 'EXPENSE') totalExpense = g._sum.amount || 0;
      });

      res.status(200).json({ totalIncome, totalExpense, balance: totalIncome - totalExpense });
    } catch (error) {
      respondError(res, error, 'Erro ao obter sumário financeiro.');
    }
  }

  // =========================================================
  // 5. SUMÁRIO MENSAL (últimos 6 meses)
  // =========================================================
  async getMonthlySummary(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const monthsData = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const label = start.toLocaleString('pt-BR', { month: 'short' });
        const aggs  = await prisma.transaction.groupBy({
          by: ['type'],
          where: { date: { gte: start, lte: end }, status: { not: 'CANCELED' } },
          _sum: { amount: true },
        });
        let income = 0, expense = 0;
        aggs.forEach((a: any) => {
          if (a.type === 'INCOME')  income  = a._sum.amount || 0;
          if (a.type === 'EXPENSE') expense = a._sum.amount || 0;
        });
        monthsData.push({ month: label, income, expense });
      }
      res.status(200).json(monthsData);
    } catch (error) {
      respondError(res, error, 'Erro ao obter sumário mensal.');
    }
  }

  // =========================================================
  // 6. BUSCAR TRANSAÇÃO POR ID
  // =========================================================
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: req.params['id'] as string },
        include: COMMON_INCLUDE,
      });
      if (!transaction) { res.status(404).json({ error: 'Transação não encontrada.' }); return; }
      res.status(200).json(transaction);
    } catch (error) {
      respondError(res, error, 'Erro ao buscar transação.');
    }
  }

  // =========================================================
  // 7. BUSCAR GRUPO (parcelas / recorrências)
  // =========================================================
  async getByGroup(req: Request, res: Response): Promise<void> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { groupId: req.params['groupId'] as string },
        include: COMMON_INCLUDE,
        orderBy: { date: 'asc' },
      });
      res.status(200).json({ transactions });
    } catch (error) {
      respondError(res, error, 'Erro ao buscar grupo.');
    }
  }

  // =========================================================
  // 8. ATUALIZAR TRANSAÇÃO
  // =========================================================
  async update(req: Request, res: Response): Promise<void> {
    try {
      const data: any = req.body;
      const updateData: any = {};

      const fields = [
        'title', 'description', 'type', 'amount', 'status', 'category',
        'paymentMethod', 'observations',
        'projectId', 'personId', 'accountPlanId', 'costCenterId', 'contextId',
      ];
      fields.forEach((f) => { if (data[f] !== undefined) updateData[f] = data[f]; });

      if (data.date !== undefined) updateData.date = new Date(data.date);

      // Permitir null explícito nos relacionamentos
      for (const f of ['projectId', 'personId', 'accountPlanId', 'costCenterId', 'contextId']) {
        if (data[f] === null) updateData[f] = null;
      }

      const updated = await prisma.transaction.update({
        where: { id: req.params['id'] as string },
        data:  updateData,
        include: COMMON_INCLUDE,
      });

      res.status(200).json({ message: 'Transação atualizada!', transaction: updated });
    } catch (error) {
      respondError(res, error, 'Erro ao atualizar transação.');
    }
  }

  // =========================================================
  // 9. CANCELAR GRUPO (todas as PENDING de um grupo)
  // =========================================================
  async cancelGroup(req: Request, res: Response): Promise<void> {
    try {
      const result = await prisma.transaction.updateMany({
        where: { groupId: req.params['groupId'] as string, status: 'PENDING' },
        data:  { status: 'CANCELED' },
      });
      res.status(200).json({ message: `${result.count} lançamento(s) cancelado(s).` });
    } catch (error) {
      respondError(res, error, 'Erro ao cancelar grupo.');
    }
  }

  // =========================================================
  // 10. CANCELAR / DELETAR TRANSAÇÃO ÚNICA
  // =========================================================
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await prisma.transaction.update({
        where: { id: req.params['id'] as string },
        data:  { status: 'CANCELED' },
      });
      res.status(200).json({ message: 'Transação cancelada.' });
    } catch (error) {
      respondError(res, error, 'Erro ao cancelar transação.');
    }
  }
}
