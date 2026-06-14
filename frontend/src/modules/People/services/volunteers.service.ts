import { api } from '../../../api/api';

export interface VolunteerAddress {
  id: string; cep: string; street: string; number: string; neighborhood: string; city: string; state: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  profession?: string | null;
  birthDate?: string | null;
  rg?: string | null;
  nationality?: string | null;
  maritalStatus?: string | null;
  role?: string | null;
  level?: string | null;
  group?: string | null;
  services?: string | null;
  schedule?: string | null;
  workDays?: string[];
  workHours?: string | null;
  supervisorId?: string | null;
  supervisor?: { id: string; name: string } | null;
  skills: string[];
  availability?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  acceptedTerms: boolean;
  documents?: any[] | null;
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
  birthDate?: string | null;
  rg?: string;
  nationality?: string;
  maritalStatus?: string;
  role?: string;
  level?: string;
  group?: string;
  services?: string;
  schedule?: string;
  workDays?: string[];
  workHours?: string;
  supervisorId?: string;
  skills?: string[];
  availability?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  acceptedTerms?: boolean;
  documents?: any[];
  cep?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

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

  async update(id: string, data: Partial<VolunteerPayload>): Promise<{ message: string; volunteer: Volunteer }> {
    const response = await api.put(`/volunteers/${id}`, data);
    return response.data;
  },

  async inactivate(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/volunteers/${id}/inactivate`);
    return response.data;
  },

  async downloadTermo(id: string, name: string): Promise<void> {
    const response = await api.get(`/volunteers/${id}/termo`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `termo_voluntariado_${name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
