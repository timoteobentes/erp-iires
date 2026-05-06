import { Router } from 'express';
import { PartnersController } from './partners.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';

const partnersRoutes = Router();
const partnersController = new PartnersController();

// Aplica o middleware de autenticação em todas as rotas
partnersRoutes.use(authMiddleware);

partnersRoutes.post('/', partnersController.create);
partnersRoutes.get('/', partnersController.list);
partnersRoutes.get('/:id', partnersController.getById);
partnersRoutes.put('/:id', partnersController.update);
partnersRoutes.patch('/:id/inactivate', partnersController.inactivate);

export default partnersRoutes;
