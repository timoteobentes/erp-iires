import { Router } from 'express';
import authRoutes from './modules/Auth/auth.routes.js';
import teamRoutes from './modules/People/Team/team.routes.js';
import volunteersRoutes from './modules/People/Volunteers/volunteers.routes.js';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/team', teamRoutes);
routes.use('/volunteers', volunteersRoutes);

export default routes;