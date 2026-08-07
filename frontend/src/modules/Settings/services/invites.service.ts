import { api } from '../../../api/api';

export interface Invite {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  role: { name: string };
  invitedBy: { name: string };
}

export interface InvitePreview {
  email: string;
  roleName: string;
  organizationName: string;
  requiresNewAccount: boolean;
}

export const invitesService = {
  async list() {
    const { data } = await api.get<{ invites: Invite[] }>('/invites');
    return data.invites;
  },
  async create(email: string, roleId: string) {
    const { data } = await api.post('/invites', { email, roleId });
    return data;
  },
  async revoke(id: string) {
    await api.delete(`/invites/${id}`);
  },
  async preview(token: string) {
    const { data } = await api.get<InvitePreview>(`/invites/by-token/${token}`);
    return data;
  },
  async accept(payload: { token: string; name?: string; password?: string }) {
    const { data } = await api.post('/invites/accept', payload);
    return data as { token: string; refreshToken: string; user: any };
  },
};
