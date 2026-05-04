import { Router } from 'express';
import authRoutes from './modules/Auth/auth.routes.js';

const routes = Router();

routes.use('/auth', authRoutes);

export default routes;