import { api } from '../../../api/api';

export type ContextType = 'INSTITUTIONAL' | 'STRATEGIC_PROJECT' | 'PARTNER_COMPANY' | 'COMMUNITY' |
  'PROGRAM' | 'AGREEMENT' | 'PUBLIC_NOTICE' | 'EVENT' | 'RESEARCH_FRONT' |
  'SUPPORTED_INITIATIVE' | 'STRATEGIC_RELATIONSHIP';
export type ContextStatus = 'ACTIVE' | 'PAUSED' | 'FINISHED' | 'ARCHIVED';

export interface InstitutionalContext {
  id: string;
  name: string;
  description?: string | null;
  type: ContextType;
  relationship?: string | null;
  status: ContextStatus;
  responsibleId?: string | null;
  responsible?: { id: string; name: string; email: string } | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  _count?: { projects: number; transactions: number; partners: number };
}

export type InstitutionalContextPayload = Omit<InstitutionalContext, 'id' | 'responsible' | '_count'>;

export const institutionalContextsService = {
  async list(params?: { search?: string; type?: string; status?: string }): Promise<InstitutionalContext[]> {
    const { data } = await api.get('/institutional-contexts', { params });
    return data;
  },
  async create(payload: InstitutionalContextPayload): Promise<InstitutionalContext> {
    const { data } = await api.post('/institutional-contexts', payload);
    return data.context;
  },
  async update(id: string, payload: Partial<InstitutionalContextPayload>): Promise<InstitutionalContext> {
    const { data } = await api.put(`/institutional-contexts/${id}`, payload);
    return data.context;
  },
  async archive(id: string): Promise<void> {
    await api.delete(`/institutional-contexts/${id}`);
  },
};

