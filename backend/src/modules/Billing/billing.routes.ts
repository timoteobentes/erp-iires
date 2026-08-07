import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { BillingController } from './billing.controller.js';

const routes = Router();
const controller = new BillingController();

routes.use(authMiddleware);

routes.get('/subscription', controller.getSubscription);
routes.post('/checkout', controller.checkout);

export default routes;
