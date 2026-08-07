import { z } from 'zod';

const nullableId = z.string().uuid().nullable().optional();
const idList = z.array(z.string().uuid()).optional();

export const createProjectSchema = z.looseObject({
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(10000).default(''),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime().nullable().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELED']).default('PLANNING'),
  budget: z.coerce.number().nonnegative().nullable().optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  managerId: z.string().uuid().optional(),
  contextId: nullableId,
  teamMemberIds: idList,
  volunteerIds: idList,
  partnerIds: idList,
  donorIds: idList,
}).refine((data) => !data.endDate || data.endDate >= data.startDate, {
  message: 'A data de fim não pode ser anterior à data de início.', path: ['endDate'],
});

export const updateProjectSchema = z.looseObject({
  name: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(10000).optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().nullable().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELED']).optional(),
  budget: z.coerce.number().nonnegative().nullable().optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  managerId: z.string().uuid().nullable().optional(),
  contextId: nullableId,
  teamMemberIds: idList,
  volunteerIds: idList,
  partnerIds: idList,
  donorIds: idList,
});

export const projectStatusSchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELED']),
});
