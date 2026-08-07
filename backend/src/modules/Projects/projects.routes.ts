import { Router } from 'express';
import { ProjectsController } from './projects.controller.js';
import { authMiddleware, requirePermission } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createProjectSchema, projectStatusSchema, updateProjectSchema } from './projects.schemas.js';
import { PERMISSIONS } from '@sigetes/shared';

const projectsRoutes = Router();
const projectsController = new ProjectsController();

projectsRoutes.use(authMiddleware);

const canManage = requirePermission(PERMISSIONS.PROJECTS_WRITE);

projectsRoutes.get('/',            projectsController.list);
projectsRoutes.get('/:id',         projectsController.getById);
projectsRoutes.post('/',           canManage, validate(createProjectSchema), projectsController.create);
projectsRoutes.put('/:id',         canManage, validate(updateProjectSchema), projectsController.update);
projectsRoutes.patch('/:id/status',canManage, validate(projectStatusSchema), projectsController.changeStatus);

export default projectsRoutes;
