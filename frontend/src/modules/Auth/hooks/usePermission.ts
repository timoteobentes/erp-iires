import { useAuthContext } from '../context/AuthContext';

// Groups that have full admin access
const ADMIN_GROUPS = ['Administrador', 'Tecnologia'];

export function usePermission() {
  const { user } = useAuthContext();
  const group = user?.group ?? '';

  const isAdmin = ADMIN_GROUPS.includes(group);

  const can = (allowedGroups: string[]) =>
    isAdmin || allowedGroups.some((g) => g === group);

  return {
    group,
    isAdmin,
    canManagePeople:    can(['Administrador', 'Tecnologia']),
    canManageFinance:   can(['Administrador', 'Tecnologia', 'Financeiro']),
    canManageProjects:  can(['Administrador', 'Tecnologia', 'Inovação']),
    canViewReports:     can(['Administrador', 'Tecnologia', 'Financeiro']),
    canManageSettings:  isAdmin,
    can,
  };
}
