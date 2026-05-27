import { api } from '../../../api/api';

// ============================================================
// TIPOS
// ============================================================

export interface Transaction {
  id: string;
  title: string;
  description?: string | null;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'CANCELED';
  category?: string | null;
  projectId?: string | null;
  donorId?: string | null;
  partnerId?: string | null;
  project?: { id: string; name: string } | null;
  donor?: { id: string; name: string } | null;
  partner?: { id: string; name: string } | null;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
}

export interface TransactionPayload {
  title: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  status?: string;
  category?: string;
  projectId?: string | null;
  donorId?: string | null;
  partnerId?: string | null;
}

// ============================================================
// SERVICE
// ============================================================

export const transactionsService = {
  async list(): Promise<Transaction[]> {
    const { data } = await api.get('/transactions');
    return data;
  },

  async getById(id: string): Promise<Transaction> {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },

  async getSummary(): Promise<TransactionSummary> {
    const { data } = await api.get('/transactions/summary');
    return data;
  },

  async getMonthlySummary(): Promise<MonthlySummary[]> {
    const { data } = await api.get('/transactions/monthly-summary');
    return data;
  },

  async create(payload: TransactionPayload): Promise<Transaction> {
    const { data } = await api.post('/transactions', payload);
    return data.transaction;
  },

  async update(id: string, payload: Partial<TransactionPayload>): Promise<Transaction> {
    const { data } = await api.put(`/transactions/${id}`, payload);
    return data.transaction;
  },

  async cancel(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};
