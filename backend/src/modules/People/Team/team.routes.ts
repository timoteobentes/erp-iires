import { Router } from 'express';
import { TeamController } from './team.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';

const teamRoutes = Router();
const teamController = new TeamController();

// APLICANDO O LEÃO DE CHÁCARA: 
// Todas as rotas abaixo desta linha exigem que o usuário esteja logado (Token JWT)
teamRoutes.use(authMiddleware);

// CRUD de Equipe
teamRoutes.post('/', teamController.create);
teamRoutes.get('/', teamController.list);
teamRoutes.get('/:id', teamController.getById);
teamRoutes.put('/:id', teamController.update);
teamRoutes.patch('/:id/inactivate', teamController.inactivate); // Usamos PATCH pois altera apenas 1 campo (status)

export default teamRoutes;