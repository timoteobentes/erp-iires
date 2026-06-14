import { api } from '../../../api/api';

export interface TeamMemberAddress {
  id: string; cep: string; street: string; number: string; neighborhood: string; city: string; state: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  personalEmail?: string | null;
  cpf?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  rg?: string | null;
  nationality?: string | null;
  maritalStatus?: string | null;
  role?: string | null;
  level?: string | null;
  group?: string | null;
  bondType?: string;
  status: string;
  createdAt?: string;
  // Financeiro / contrato
  pis?: string | null;
  voterRegistration?: string | null;
  hasCnpj?: boolean | null;
  cnpjNumber?: string | null;
  issuesInvoice?: boolean | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankAgency?: string | null;
  pixKey?: string | null;
  salary?: number | null;
  workDays?: string[];
  workHours?: string | null;
  documents?: any[] | null;
  address?: TeamMemberAddress | null;
}

export interface TeamMemberPayload {
  name: string;
  email: string;
  personal_email?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string | null;
  rg?: string;
  nationality?: string;
  maritalStatus?: string;
  role?: string;
  level?: string;
  group?: string;
  bondType?: string;
  pis?: string;
  voterRegistration?: string;
  hasCnpj?: boolean;
  cnpjNumber?: string;
  issuesInvoice?: boolean;
  bankName?: string;
  bankAccount?: string;
  bankAgency?: string;
  pixKey?: string;
  salary?: number | null;
  workDays?: string[];
  workHours?: string;
  documents?: any[];
  cep?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

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

  async update(id: string, data: Partial<TeamMemberPayload>): Promise<{ message: string; member: TeamMember }> {
    const response = await api.put(`/team/${id}`, data);
    return response.data;
  },

  async inactivate(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/team/${id}/inactivate`);
    return response.data;
  },
};
