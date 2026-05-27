import { api } from '../../../api/api';

// ============================================================
// TIPOS
// ============================================================

export interface TeamMemberAddress {
  id: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  personalEmail?: string | null;
  cpf?: string | null;
  phone?: string | null;
  role?: string | null;
  level?: string | null;
  group?: string | null;
  status: string;
  createdAt?: string;
  address?: TeamMemberAddress | null;
}

// Payload enviado ao backend (snake_case para address = padrão do controller)
export interface TeamMemberPayload {
  name: string;
  email: string;
  personal_email?: string;
  cpf?: string;
  phone?: string;
  role?: string;   // opcional — só nome, email e grupo são obrigatórios
  level?: string;
  group?: string;
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

export const teamService = {
  async list(): Promise<TeamMember[]> {
    const response = await api.get('/team');
    return response.data;
  },

  async getById(id: string): Promise<TeamMember> {
    const response = await api.get(`/team/${id}`);
    return response.data;
  },

  async create(data: TeamMemberPayload): Promise<{ message: string; temporaryPassword: string; member: TeamMember }> {
    const response = await api.post('/team', data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<TeamMemberPayload>,
  ): Promise<{ message: string; member: TeamMember }> {
    const response = await api.put(`/team/${id}`, data);
    return response.data;
  },

  async inactivate(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/team/${id}/inactivate`);
    return response.data;
  },
};
