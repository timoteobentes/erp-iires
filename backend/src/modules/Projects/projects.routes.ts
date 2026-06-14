import { Router } from 'express';
import { ProjectsController } from './projects.controller.js';
import { authMiddleware, requireGroups } from '../../shared/middlewares/auth.middleware.js';

const projectsRoutes = Router();
const projectsController = new ProjectsController();

projectsRoutes.use(authMiddleware);

const canManage = requireGroups('Administrador', 'Tecnologia', 'Inovação');

projectsRoutes.get('/',            projectsController.list);
projectsRoutes.get('/:id',         projectsController.getById);
projectsRoutes.post('/',           canManage, projectsController.create);
projectsRoutes.put('/:id',         canManage, projectsController.update);
projectsRoutes.patch('/:id/status',canManage, projectsController.changeStatus);

export default projectsRoutes;
