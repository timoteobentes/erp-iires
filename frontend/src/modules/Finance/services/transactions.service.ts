import { api } from '../../../api/api';

// ──────────────────────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────────────────────

export interface Attachment {
  name: string;
  mimeType: string;
  size: number;
  data: string; // base64
}

export interface Transaction {
  id: string;
  title: string;
  description?: string | null;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'CANCELED';
  category?: string | null;
  paymentMethod?: string | null;
  observations?: string | null;
  attachments?: Attachment[] | null;
  accountPlanId?: string | null;
  costCenterId?: string | null;
  groupId?: string | null;
  groupType?: 'INSTALLMENT' | 'RECURRING' | null;
  installmentNumber?: number | null;
  installmentTotal?: number | null;
  recurrenceFrequency?: string | null;
  recurrenceEndDate?: string | null;
  projectId?: string | null;
  donorId?: string | null;
  partnerId?: string | null;
  contextId?: string | null;
  project?: { id: string; name: string } | null;
  donor?: { id: string; name: string } | null;
  partner?: { id: string; name: string } | null;
  accountPlan?: { id: string; code: string; name: string } | null;
  costCenter?: { id: string; code: string; name: string } | null;
  context?: { id: string; name: string; type: string; status: string } | null;
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
  paymentMethod?: string;
  observations?: string;
  attachments?: Attachment[];
  accountPlanId?: string | null;
  costCenterId?: string | null;
  projectId?: string | null;
  donorId?: string | null;
  partnerId?: string | null;
  contextId?: string | null;
}

export interface BatchPayload {
  groupType: 'INSTALLMENT' | 'RECURRING';
  type: 'INCOME' | 'EXPENSE';
  title: string;
  description?: string;
  category?: string;
  status?: string;
  paymentMethod?: string;
  observations?: string;
  attachments?: Attachment[];
  accountPlanId?: string | null;
  costCenterId?: string | null;
  projectId?: string | null;
  donorId?: string | null;
  partnerId?: string | null;
  contextId?: string | null;
  firstDate: string;
  // Parcelamento
  totalAmount?: number;
  installmentTotal?: number;
  // Recorrência
  amount?: number;
  recurrenceFrequency?: string;
  recurrenceEndDate?: string;
}

// ──────────────────────────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────────────────────────

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

  async createBatch(payload: BatchPayload): Promise<{ transactions: Transaction[]; groupId: string }> {
    const { data } = await api.post('/transactions/batch', payload);
    return { transactions: data.transactions, groupId: data.groupId };
  },

  async getByGroup(groupId: string): Promise<Transaction[]> {
    const { data } = await api.get(`/transactions/group/${groupId}`);
    return data.transactions;
  },

  async cancelGroup(groupId: string): Promise<void> {
    await api.delete(`/transactions/group/${groupId}`);
  },

  async update(id: string, payload: Partial<TransactionPayload>): Promise<Transaction> {
    const { data } = await api.put(`/transactions/${id}`, payload);
    return data.transaction;
  },

  async cancel(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};
