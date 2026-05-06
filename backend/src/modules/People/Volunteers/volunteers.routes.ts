import { Router } from 'express';
import { VolunteersController } from './volunteers.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';

const volunteersRoutes = Router();
const volunteersController = new VolunteersController();

// Proteção da rota
volunteersRoutes.use(authMiddleware);

// CRUD
volunteersRoutes.post('/', volunteersController.create);
volunteersRoutes.get('/', volunteersController.list);
volunteersRoutes.get('/:id', volunteersController.getById);
volunteersRoutes.put('/:id', volunteersController.update);
volunteersRoutes.patch('/:id/inactivate', volunteersController.inactivate);

export default volunteersRoutes;