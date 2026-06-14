import { Router } from 'express';
import { TeamController } from './team.controller.js';
import { authMiddleware, requireGroups } from '../../../shared/middlewares/auth.middleware.js';

const teamRoutes = Router();
const teamController = new TeamController();

teamRoutes.use(authMiddleware);

const adminOrRH = requireGroups('Administrador', 'Tecnologia');

teamRoutes.get('/',                    teamController.list);
teamRoutes.get('/:id',                 teamController.getById);
teamRoutes.post('/',                   adminOrRH, teamController.create);
teamRoutes.put('/:id',                 adminOrRH, teamController.update);
teamRoutes.patch('/:id/inactivate',    adminOrRH, teamController.inactivate);

export default teamRoutes;
