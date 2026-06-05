import { api } from '../../../api/api';

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

export const costCentersService = {
  async list(active?: boolean): Promise<CostCenter[]> {
    const params = active !== undefined ? `?active=${active}` : '';
    const { data } = await api.get(`/cost-centers${params}`);
    return data.costCenters;
  },

  async create(payload: Omit<CostCenter, 'id' | 'active'>): Promise<CostCenter> {
    const { data } = await api.post('/cost-centers', payload);
    return data.costCenter;
  },

  async update(id: string, payload: Partial<Omit<CostCenter, 'id'>>): Promise<CostCenter> {
    const { data } = await api.put(`/cost-centers/${id}`, payload);
    return data.costCenter;
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`/cost-centers/${id}`);
  },
};
