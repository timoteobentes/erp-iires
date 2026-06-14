import { Router } from 'express';
import { VolunteersController } from './volunteers.controller.js';
import { authMiddleware, requireGroups } from '../../../shared/middlewares/auth.middleware.js';

const volunteersRoutes = Router();
const volunteersController = new VolunteersController();

volunteersRoutes.use(authMiddleware);

const adminOrRH = requireGroups('Administrador', 'Tecnologia');

volunteersRoutes.get('/',                    volunteersController.list);
volunteersRoutes.get('/:id',                 volunteersController.getById);
volunteersRoutes.get('/:id/termo',           volunteersController.generateTermo);
volunteersRoutes.post('/',                   adminOrRH, volunteersController.create);
volunteersRoutes.put('/:id',                 adminOrRH, volunteersController.update);
volunteersRoutes.patch('/:id/inactivate',    adminOrRH, volunteersController.inactivate);

export default volunteersRoutes;
