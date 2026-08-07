import { useAuthContext } from '../context/AuthContext';
import { PERMISSIONS } from '@sigetes/shared';

export function usePermission() {
  const { user } = useAuthContext();
  const permissions = user?.membership?.permissions ?? [];
  const isOwner = user?.membership?.isOwner ?? false;

  const can = (...perms: string[]) => isOwner || perms.every((p) => permissions.includes(p));

  return {
    role: user?.membership?.role ?? '',
    isOwner,
    isAdmin: isOwner,
    permissions,
    canManagePeople:    can(PERMISSIONS.PEOPLE_WRITE),
    canManageFinance:   can(PERMISSIONS.FINANCE_TRANSACTIONS_WRITE),
    canManageProjects:  can(PERMISSIONS.PROJECTS_WRITE),
    canViewReports:     can(PERMISSIONS.REPORTS_VIEW),
    canManageSettings:  isOwner,
    can,
  };
}
