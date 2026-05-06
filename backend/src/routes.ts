import { Router } from 'express';
import authRoutes from './modules/Auth/auth.routes.js';
import teamRoutes from './modules/People/Team/team.routes.js';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/team', teamRoutes);

export default routes;