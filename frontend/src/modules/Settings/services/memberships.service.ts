import { api } from '../../../api/api';

export interface Membership {
  id: string;
  isOwner: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  user: { id: string; name: string; email: string; avatarUrl: string | null; status: string; lastLoginAt: string | null };
  role: { id: string; name: string; isSystem: boolean };
  member: { id: string; jobTitle: string | null; department: string | null } | null;
}

export interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: string[];
}

export const membershipsService = {
  async list() {
    const { data } = await api.get<{ memberships: Membership[] }>('/memberships');
    return data.memberships;
  },
  async updateRole(id: string, roleId: string) {
    const { data } = await api.patch(`/memberships/${id}/role`, { roleId });
    return data.membership as Membership;
  },
  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    const { data } = await api.patch(`/memberships/${id}/status`, { status });
    return data.membership as Membership;
  },
};

export const rolesService = {
  async list() {
    const { data } = await api.get<{ roles: Role[] }>('/roles');
    return data.roles;
  },
};
