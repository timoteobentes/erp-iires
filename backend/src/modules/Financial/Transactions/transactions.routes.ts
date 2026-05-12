import { Router } from 'express';
import { TransactionsController } from './transactions.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';

const transactionsRoutes = Router();
const transactionsController = new TransactionsController();

// Aplica o middleware de autenticação em todas as rotas
transactionsRoutes.use(authMiddleware);

transactionsRoutes.post('/', transactionsController.create);
transactionsRoutes.get('/', transactionsController.list);
// ATENÇÃO: a rota /summary deve vir antes de /:id para não ser interpretada como um ID
transactionsRoutes.get('/summary', transactionsController.getSummary);
transactionsRoutes.get('/:id', transactionsController.getById);
transactionsRoutes.put('/:id', transactionsController.update);
transactionsRoutes.delete('/:id', transactionsController.delete);

export default transactionsRoutes;
