import prisma from '../../config/prisma.js';
import { getContext } from '../context/request-context.js';
import { NotFoundError } from '../errors/not-found.error.js';

/**
 * Modelos que pertencem a uma organização (têm organizationId).
 * Tudo que não estiver aqui (User, RefreshToken, Organization, Plan, WebhookEvent...)
 * passa direto, sem filtro — são modelos de camada plataforma.
 */
const TENANT_MODELS = new Set([
  'Membership',
  'Role',
  'Invite',
  'Member',
  'Person',
  'Project',
  'ProjectMember',
  'ProjectPerson',
  'AccountPlan',
  'CostCenter',
  'Transaction',
  'InstitutionalContext',
  'Attachment',
  'Notification',
  'AuditLog',
]);

// Operações que leem/escrevem em massa: o filtro entra direto no `where`.
const BULK_OPS = new Set(['findMany', 'count', 'groupBy', 'updateMany', 'deleteMany']);

// findUnique não aceita campos soltos no `where` — reescrevemos como findFirst.
const UNIQUE_READ_OPS = new Set(['findUnique', 'findUniqueOrThrow']);

// update/delete de um registro só: primeiro confirmamos que é desta organização.
const SINGLE_MUTATION_OPS = new Set(['update', 'delete']);

function uncapitalize(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

export const tenantPrisma = prisma.$extends({
  name: 'tenant-scope',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !TENANT_MODELS.has(model)) {
          return query(args);
        }

        const { organizationId } = getContext();
        const delegate = (prisma as any)[uncapitalize(model)];
        const a = args as Record<string, any>;

        if (BULK_OPS.has(operation)) {
          a.where = { ...a.where, organizationId };
          return query(a as typeof args);
        }

        if (UNIQUE_READ_OPS.has(operation)) {
          const result = await delegate.findFirst({
            ...a,
            where: { ...a.where, organizationId },
          });
          if (!result && operation === 'findUniqueOrThrow') {
            throw new NotFoundError(model);
          }
          return result;
        }

        if (SINGLE_MUTATION_OPS.has(operation)) {
          const owned = await delegate.findFirst({
            where: { ...a.where, organizationId },
            select: { id: true },
          });
          if (!owned) {
            throw new NotFoundError(model);
          }
          return query(a as typeof args);
        }

        if (operation === 'create') {
          a.data = { ...a.data, organizationId };
          return query(a as typeof args);
        }

        if (operation === 'createMany') {
          a.data = Array.isArray(a.data)
            ? a.data.map((row: Record<string, unknown>) => ({ ...row, organizationId }))
            : { ...a.data, organizationId };
          return query(a as typeof args);
        }

        // findFirst / findFirstOrThrow / aggregate e demais: filtra também.
        a.where = { ...a.where, organizationId };
        return query(a as typeof args);
      },
    },
  },
});

export type TenantPrismaClient = typeof tenantPrisma;
