import { api } from '../../../api/api';

// ============================================================
// TIPOS
// ============================================================

export interface DonorAddress {
  id: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Donor {
  id: string;
  type: string; // 'PF' | 'PJ'
  name: string;
  document: string; // CPF ou CNPJ sem máscara
  phone?: string | null;
  email?: string | null;
  recurrence: string;
  paymentMethod: string;
  status: string;
  createdAt?: string;
  address?: DonorAddress | null;
}

export interface DonorPayload {
  type: string; // 'PF' | 'PJ'
  name: string;
  document: string; // sem máscara
  phone?: string;
  email?: string;
  recurrence?: string;
  paymentMethod?: string;
  cep?: string;
  address?: string; // → backend mapeia para street
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

// ============================================================
// SERVICE
// ============================================================

export const donorsService = {
  async list(): Promise<Donor[]> {
    const response = await api.get('/donors');
    return response.data;
  },

  async getById(id: string): Promise<Donor> {
    const response = await api.get(`/donors/${id}`);
    return response.data;
  },

  async create(data: DonorPayload): Promise<{ message: string; donor: Donor }> {
    const response = await api.post('/donors', data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<DonorPayload>,
  ): Promise<{ message: string; donor: Donor }> {
    const response = await api.put(`/donors/${id}`, data);
    return response.data;
  },

  async inactivate(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/donors/${id}/inactivate`);
    return response.data;
  },
};
