import { Router } from 'express';
import { authMiddleware, requirePermission } from '../../shared/middlewares/auth.middleware.js';
import { MembershipsController } from './memberships.controller.js';
import { PERMISSIONS } from '@sigetes/shared';

const routes = Router();
const controller = new MembershipsController();
const canManage = requirePermission(PERMISSIONS.ORG_MEMBERS_MANAGE);

routes.use(authMiddleware);

routes.get('/', controller.list);
routes.patch('/:id/role', canManage, controller.updateRole);
routes.patch('/:id/status', canManage, controller.updateStatus);

export default routes;
