import { Router } from 'express';
import { DonorsController } from './donors.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';

const donorsRoutes = Router();
const donorsController = new DonorsController();

// Aplica o middleware de autenticação em todas as rotas
donorsRoutes.use(authMiddleware);

donorsRoutes.post('/', donorsController.create);
donorsRoutes.get('/', donorsController.list);
donorsRoutes.get('/:id', donorsController.getById);
donorsRoutes.put('/:id', donorsController.update);
donorsRoutes.patch('/:id/inactivate', donorsController.inactivate);

export default donorsRoutes;
