import { api } from '../../../api/api';

// ============================================================
// TIPOS
// ============================================================

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  budget?: number | null;
  progress?: number;
  manager?: { id: string; name: string } | null;
  volunteers?: { id: string; name: string }[];
  partners?: { id: string; name: string }[];
  createdAt?: string;
}

export interface ProjectPayload {
  name: string;
  description?: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  managerId?: string;
  volunteerIds?: string[];
  partnerIds?: string[];
  budget?: number | null;
  progress?: number;
}

// ============================================================
// SERVICE
// ============================================================

export const projectsService = {
  async list(): Promise<Project[]> {
    const { data } = await api.get('/projects');
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  async create(payload: ProjectPayload): Promise<Project> {
    const { data } = await api.post('/projects', payload);
    return data.project;
  },

  async update(id: string, payload: Partial<ProjectPayload>): Promise<Project> {
    const { data } = await api.put(`/projects/${id}`, payload);
    return data.project;
  },

  async changeStatus(id: string, status: string): Promise<void> {
    await api.patch(`/projects/${id}/status`, { status });
  },
};
