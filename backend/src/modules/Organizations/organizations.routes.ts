import { Router } from 'express';
import { authMiddleware, requirePermission } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { OrganizationsController } from './organizations.controller.js';
import { updateOrganizationSchema } from './organizations.schemas.js';
import { PERMISSIONS } from '@sigetes/shared';

const routes = Router();
const controller = new OrganizationsController();

routes.use(authMiddleware);

routes.get('/me', controller.getMe);
routes.patch('/me', requirePermission(PERMISSIONS.ORG_SETTINGS_WRITE), validate(updateOrganizationSchema), controller.updateMe);

export default routes;
