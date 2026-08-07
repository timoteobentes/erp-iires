import { Router } from 'express';
import { authMiddleware, requirePermission } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { InstitutionalContextsController } from './institutional-contexts.controller.js';
import { createInstitutionalContextSchema, updateInstitutionalContextSchema } from './institutional-contexts.schemas.js';
import { PERMISSIONS } from '@sigetes/shared';

const routes = Router();
const controller = new InstitutionalContextsController();
const canManage = requirePermission(PERMISSIONS.CONTEXTS_MANAGE);

routes.use(authMiddleware);
routes.get('/', controller.list);
routes.get('/:id', controller.getById);
routes.post('/', canManage, validate(createInstitutionalContextSchema), controller.create);
routes.put('/:id', canManage, validate(updateInstitutionalContextSchema), controller.update);
routes.delete('/:id', canManage, controller.archive);

export default routes;
