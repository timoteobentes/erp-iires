import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const notificationsRoutes = Router();
const ctrl = new NotificationsController();

notificationsRoutes.use(authMiddleware);

notificationsRoutes.get('/',                    ctrl.list);
notificationsRoutes.patch('/read-all',          ctrl.markAllRead);
notificationsRoutes.patch('/:id/read',          ctrl.markRead);
notificationsRoutes.delete('/:id',              ctrl.deleteOne);
notificationsRoutes.post('/',                   ctrl.create);

export default notificationsRoutes;
