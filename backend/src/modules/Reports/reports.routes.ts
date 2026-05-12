import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const reportsRoutes = Router();
const reportsController = new ReportsController();

// Aplica o middleware de autenticação em todas as rotas de relatório
reportsRoutes.use(authMiddleware);

// Rota de exportação central
reportsRoutes.post('/export', reportsController.exportReport);

export default reportsRoutes;
