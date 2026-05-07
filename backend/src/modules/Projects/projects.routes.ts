import { Router } from 'express';
import { ProjectsController } from './projects.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const projectsRoutes = Router();
const projectsController = new ProjectsController();

// Aplica o middleware de autenticação em todas as rotas
projectsRoutes.use(authMiddleware);

projectsRoutes.post('/', projectsController.create);
projectsRoutes.get('/', projectsController.list);
projectsRoutes.get('/:id', projectsController.getById);
projectsRoutes.put('/:id', projectsController.update);
projectsRoutes.patch('/:id/status', projectsController.changeStatus);

export default projectsRoutes;
