import { Router } from 'express';
import { TransactionsController } from './transactions.controller.js';
import { authMiddleware, requireGroups } from '../../../shared/middlewares/auth.middleware.js';

const transactionsRoutes = Router();
const ctrl = new TransactionsController();

transactionsRoutes.use(authMiddleware);

const canManage = requireGroups('Administrador', 'Tecnologia', 'Financeiro');

// Rotas fixas ANTES de /:id para evitar conflito de parâmetro
transactionsRoutes.get('/summary',           ctrl.getSummary);
transactionsRoutes.get('/monthly-summary',   ctrl.getMonthlySummary);
transactionsRoutes.get('/group/:groupId',    ctrl.getByGroup);
transactionsRoutes.post('/batch',            canManage, ctrl.createBatch);
transactionsRoutes.delete('/group/:groupId', canManage, ctrl.cancelGroup);

// CRUD padrão
transactionsRoutes.get('/',      ctrl.list);
transactionsRoutes.get('/:id',   ctrl.getById);
transactionsRoutes.post('/',     canManage, ctrl.create);
transactionsRoutes.put('/:id',   canManage, ctrl.update);
transactionsRoutes.delete('/:id',canManage, ctrl.delete);

export default transactionsRoutes;
