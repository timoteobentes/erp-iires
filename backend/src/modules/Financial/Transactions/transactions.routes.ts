import { Router } from 'express';
import { TransactionsController } from './transactions.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';

const transactionsRoutes = Router();
const ctrl = new TransactionsController();

transactionsRoutes.use(authMiddleware);

// Rotas fixas ANTES de /:id para evitar conflito de parâmetro
transactionsRoutes.get('/summary',         ctrl.getSummary);
transactionsRoutes.get('/monthly-summary', ctrl.getMonthlySummary);
transactionsRoutes.post('/batch',          ctrl.createBatch);
transactionsRoutes.get('/group/:groupId',  ctrl.getByGroup);
transactionsRoutes.delete('/group/:groupId', ctrl.cancelGroup);

// CRUD padrão
transactionsRoutes.get('/',     ctrl.list);
transactionsRoutes.post('/',    ctrl.create);
transactionsRoutes.get('/:id',  ctrl.getById);
transactionsRoutes.put('/:id',  ctrl.update);
transactionsRoutes.delete('/:id', ctrl.delete);

export default transactionsRoutes;
