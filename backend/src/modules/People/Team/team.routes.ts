import { Router } from 'express';
import { TeamController } from './team.controller.js';
import { authMiddleware, requirePermission } from '../../../shared/middlewares/auth.middleware.js';
import { PERMISSIONS } from '@sigetes/shared';

const teamRoutes = Router();
const teamController = new TeamController();

teamRoutes.use(authMiddleware);

const adminOrRH = requirePermission(PERMISSIONS.PEOPLE_EMPLOYEES_WRITE);

teamRoutes.get('/',                    teamController.list);
teamRoutes.get('/:id',                 teamController.getById);
teamRoutes.post('/',                   adminOrRH, teamController.create);
teamRoutes.put('/:id',                 adminOrRH, teamController.update);
teamRoutes.patch('/:id/inactivate',    adminOrRH, teamController.inactivate);

export default teamRoutes;
