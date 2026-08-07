import { api } from '../../../api/api';

export interface Organization {
  id: string;
  slug: string;
  legalName: string;
  tradeName: string | null;
  document: string;
  legalNature: string;
  email: string;
  phone: string | null;
  website: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  legalRepName: string | null;
  legalRepDocument: string | null;
  legalRepRole: string | null;
  legalRepEmail: string | null;
  logoUrl: string | null;
  brandColor: string | null;
}

export const organizationService = {
  async getMe() {
    const { data } = await api.get<{ organization: Organization }>('/organizations/me');
    return data.organization;
  },
  async updateMe(payload: Partial<Organization>) {
    const { data } = await api.patch<{ message: string; organization: Organization }>('/organizations/me', payload);
    return data.organization;
  },
};
