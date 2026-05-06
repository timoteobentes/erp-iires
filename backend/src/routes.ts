import { Router } from 'express';
import authRoutes from './modules/Auth/auth.routes.js';
import teamRoutes from './modules/People/Team/team.routes.js';
import volunteersRoutes from './modules/People/Volunteers/volunteers.routes.js';
import donorsRoutes from './modules/People/Donors/donors.routes.js';
import partnersRoutes from './modules/People/Partners/partners.routes.js';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/team', teamRoutes);
routes.use('/volunteers', volunteersRoutes);
routes.use('/donors', donorsRoutes);
routes.use('/partners', partnersRoutes);

export default routes;