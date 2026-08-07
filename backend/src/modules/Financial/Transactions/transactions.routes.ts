import { Router } from 'express';
import { TransactionsController } from './transactions.controller.js';
import { authMiddleware, requirePermission } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { createBatchTransactionSchema, createTransactionSchema, updateTransactionSchema } from './transactions.schemas.js';
import { PERMISSIONS } from '@sigetes/shared';

const transactionsRoutes = Router();
const ctrl = new TransactionsController();

transactionsRoutes.use(authMiddleware);

const canManage = requirePermission(PERMISSIONS.FINANCE_TRANSACTIONS_WRITE);

// Rotas fixas ANTES de /:id para evitar conflito de parâmetro
transactionsRoutes.get('/summary',           ctrl.getSummary);
transactionsRoutes.get('/monthly-summary',   ctrl.getMonthlySummary);
transactionsRoutes.get('/group/:groupId',    ctrl.getByGroup);
transactionsRoutes.post('/batch',            canManage, validate(createBatchTransactionSchema), ctrl.createBatch);
transactionsRoutes.delete('/group/:groupId', canManage, ctrl.cancelGroup);

// CRUD padrão
transactionsRoutes.get('/',      ctrl.list);
transactionsRoutes.get('/:id',   ctrl.getById);
transactionsRoutes.post('/',     canManage, validate(createTransactionSchema), ctrl.create);
transactionsRoutes.put('/:id',   canManage, validate(updateTransactionSchema), ctrl.update);
transactionsRoutes.delete('/:id',canManage, ctrl.delete);

export default transactionsRoutes;
