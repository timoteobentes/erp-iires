import { api } from '../../../api/api';

export interface AccountPlan {
  id: string;
  code: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
  parentId: string | null;
  parent?: { id: string; code: string; name: string } | null;
  description: string | null;
  active: boolean;
}

export const accountPlansService = {
  async list(filters?: { type?: string; active?: boolean }): Promise<AccountPlan[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.active !== undefined) params.set('active', String(filters.active));
    const { data } = await api.get(`/account-plans?${params}`);
    return data.accountPlans;
  },

  async create(payload: Omit<AccountPlan, 'id' | 'active' | 'parent'>): Promise<AccountPlan> {
    const { data } = await api.post('/account-plans', payload);
    return data.accountPlan;
  },

  async update(id: string, payload: Partial<Omit<AccountPlan, 'id' | 'parent'>>): Promise<AccountPlan> {
    const { data } = await api.put(`/account-plans/${id}`, payload);
    return data.accountPlan;
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`/account-plans/${id}`);
  },
};
