/**
 * Catálogo único de permissões do SIGETES, no formato `modulo.recurso:acao`.
 * Backend e frontend importam deste mesmo lugar — nunca duplicar strings de permissão.
 */
export const PERMISSIONS = {
  ORG_SETTINGS_READ: 'org.settings:read',
  ORG_SETTINGS_WRITE: 'org.settings:write',
  ORG_MEMBERS_MANAGE: 'org.members:manage',
  ORG_ROLES_MANAGE: 'org.roles:manage',

  PEOPLE_READ: 'people.persons:read',
  PEOPLE_WRITE: 'people.persons:write',
  PEOPLE_EMPLOYEES_READ_SENSITIVE: 'people.employees:read_sensitive',
  PEOPLE_EMPLOYEES_WRITE: 'people.employees:write',

  PROJECTS_READ: 'projects:read',
  PROJECTS_WRITE: 'projects:write',

  FINANCE_TRANSACTIONS_READ: 'finance.transactions:read',
  FINANCE_TRANSACTIONS_WRITE: 'finance.transactions:write',
  FINANCE_TRANSACTIONS_APPROVE: 'finance.transactions:approve',
  FINANCE_ACCOUNT_PLANS_MANAGE: 'finance.account_plans:manage',
  FINANCE_COST_CENTERS_MANAGE: 'finance.cost_centers:manage',

  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  CONTEXTS_MANAGE: 'contexts:manage',

  AUDIT_LOG_READ: 'audit.log:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

/**
 * Papéis semeados automaticamente em toda organização nova.
 * `Administrador` é o papel OWNER: não editável, sempre com todas as permissões.
 */
export const DEFAULT_ROLES: Array<{
  name: string;
  isSystem: boolean;
  permissions: Permission[];
}> = [
  {
    name: 'Administrador',
    isSystem: true,
    permissions: ALL_PERMISSIONS,
  },
  {
    name: 'Diretor',
    isSystem: true,
    permissions: [
      PERMISSIONS.ORG_SETTINGS_READ,
      PERMISSIONS.PEOPLE_READ,
      PERMISSIONS.PEOPLE_EMPLOYEES_READ_SENSITIVE,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.PROJECTS_WRITE,
      PERMISSIONS.FINANCE_TRANSACTIONS_READ,
      PERMISSIONS.FINANCE_TRANSACTIONS_APPROVE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.CONTEXTS_MANAGE,
      PERMISSIONS.AUDIT_LOG_READ,
    ],
  },
  {
    name: 'Financeiro',
    isSystem: true,
    permissions: [
      PERMISSIONS.PEOPLE_READ,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.FINANCE_TRANSACTIONS_READ,
      PERMISSIONS.FINANCE_TRANSACTIONS_WRITE,
      PERMISSIONS.FINANCE_TRANSACTIONS_APPROVE,
      PERMISSIONS.FINANCE_ACCOUNT_PLANS_MANAGE,
      PERMISSIONS.FINANCE_COST_CENTERS_MANAGE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
    ],
  },
  {
    name: 'Comercial',
    isSystem: true,
    permissions: [
      PERMISSIONS.PEOPLE_READ,
      PERMISSIONS.PEOPLE_WRITE,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
  {
    name: 'Projetos',
    isSystem: true,
    permissions: [
      PERMISSIONS.PEOPLE_READ,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.PROJECTS_WRITE,
      PERMISSIONS.FINANCE_TRANSACTIONS_READ,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
  {
    name: 'Leitor',
    isSystem: true,
    permissions: [
      PERMISSIONS.PEOPLE_READ,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.FINANCE_TRANSACTIONS_READ,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
];
