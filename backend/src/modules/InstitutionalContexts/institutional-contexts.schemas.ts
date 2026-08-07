import { z } from 'zod';

const contextTypes = [
  'INSTITUTIONAL', 'STRATEGIC_PROJECT', 'PARTNER_COMPANY', 'COMMUNITY', 'PROGRAM',
  'AGREEMENT', 'PUBLIC_NOTICE', 'EVENT', 'RESEARCH_FRONT', 'SUPPORTED_INITIATIVE',
  'STRATEGIC_RELATIONSHIP',
] as const;

const relationships = [
  'INTERNAL', 'TECHNICAL_COOPERATION', 'STRATEGIC_PARTNERSHIP', 'SUPPORTED_INITIATIVE',
  'INCUBATED_INITIATIVE', 'RESEARCH_AND_DEVELOPMENT', 'COMMERCIAL_RELATIONSHIP',
] as const;

const statuses = ['ACTIVE', 'PAUSED', 'FINISHED', 'ARCHIVED'] as const;

const optionalText = z.string().trim().max(5000).nullable().optional();
const optionalId = z.string().uuid().nullable().optional();
const optionalDate = z.iso.datetime().nullable().optional();

const institutionalContextFields = {
  name: z.string().trim().min(2, 'Informe um nome com pelo menos 2 caracteres.').max(160),
  description: optionalText,
  type: z.enum(contextTypes),
  relationship: z.enum(relationships).nullable().optional(),
  status: z.enum(statuses),
  responsibleId: optionalId,
  startDate: optionalDate,
  endDate: optionalDate,
  notes: optionalText,
};

const validateDateRange = (data: { startDate?: string | null | undefined; endDate?: string | null | undefined }) =>
  !data.startDate || !data.endDate || data.endDate >= data.startDate;

export const createInstitutionalContextSchema = z.object({
  ...institutionalContextFields,
  status: z.enum(statuses).default('ACTIVE'),
}).refine(validateDateRange, {
  message: 'A data de fim nao pode ser anterior a data de inicio.',
  path: ['endDate'],
});

export const updateInstitutionalContextSchema = z.object(institutionalContextFields).partial().refine(validateDateRange, {
  message: 'A data de fim nao pode ser anterior a data de inicio.',
  path: ['endDate'],
});
