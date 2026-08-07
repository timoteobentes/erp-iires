import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { RolesController } from './roles.controller.js';

const routes = Router();
const controller = new RolesController();

routes.use(authMiddleware);
routes.get('/', controller.list);

export default routes;
