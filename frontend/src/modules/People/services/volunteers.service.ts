import { api } from '../../../api/api';

// ============================================================
// TIPOS
// ============================================================

export interface VolunteerAddress {
  id: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  profession?: string | null;
  birthDate?: string | null;
  skills: string[];
  availability?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  acceptedTerms: boolean;
  status: string;
  hoursDonated: number;
  activeProjects: number;
  createdAt?: string;
  address?: VolunteerAddress | null;
}

export interface VolunteerPayload {
  name: string;
  email?: string;
  cpf?: string;
  phone?: string;
  profession?: string;
  birthDate?: string | null; // ISO string (ex: "2000-01-15T00:00:00.000Z")
  skills?: string[];
  availability?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  acceptedTerms?: boolean;
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

export const volunteersService = {
  async list(): Promise<Volunteer[]> {
    const response = await api.get('/volunteers');
    return response.data;
  },

  async getById(id: string): Promise<Volunteer> {
    const response = await api.get(`/volunteers/${id}`);
    return response.data;
  },

  async create(data: VolunteerPayload): Promise<{ message: string; volunteer: Volunteer }> {
    const response = await api.post('/volunteers', data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<VolunteerPayload>,
  ): Promise<{ message: string; volunteer: Volunteer }> {
    const response = await api.put(`/volunteers/${id}`, data);
    return response.data;
  },

  async inactivate(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/volunteers/${id}/inactivate`);
    return response.data;
  },
};
