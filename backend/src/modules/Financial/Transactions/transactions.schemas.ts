import { z } from 'zod';

const nullableId = z.string().uuid().nullable().optional();

const transactionFields = {
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive(),
  date: z.iso.datetime(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELED']).optional(),
  category: z.string().trim().max(120).optional(),
  paymentMethod: z.string().trim().max(100).optional(),
  observations: z.string().trim().max(10000).optional(),
  accountPlanId: nullableId, costCenterId: nullableId, projectId: nullableId,
  personId: nullableId, contextId: nullableId,
};

export const createTransactionSchema = z.object(transactionFields);
export const updateTransactionSchema = z.object(transactionFields).partial();

export const createBatchTransactionSchema = z.looseObject({
  ...transactionFields,
  date: z.never().optional(),
  amount: z.coerce.number().positive().optional(),
  groupType: z.enum(['INSTALLMENT', 'RECURRING']),
  firstDate: z.iso.datetime(),
  totalAmount: z.coerce.number().positive().optional(),
  installmentTotal: z.coerce.number().int().min(2).max(120).optional(),
  recurrenceFrequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  recurrenceEndDate: z.iso.datetime().optional(),
}).superRefine((data, ctx) => {
  if (data.groupType === 'INSTALLMENT' && (!data.totalAmount || !data.installmentTotal)) {
    ctx.addIssue({ code: 'custom', message: 'Informe valor total e número de parcelas.' });
  }
  if (data.groupType === 'RECURRING' && (!data.amount || !data.recurrenceFrequency)) {
    ctx.addIssue({ code: 'custom', message: 'Informe valor e frequência da recorrência.' });
  }
});
