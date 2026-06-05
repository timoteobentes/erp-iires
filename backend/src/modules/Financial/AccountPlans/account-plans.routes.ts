import { Router } from 'express';
import { AccountPlansController } from './account-plans.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';

const accountPlansRoutes = Router();
const ctrl = new AccountPlansController();

accountPlansRoutes.use(authMiddleware);

accountPlansRoutes.get('/',      ctrl.list);
accountPlansRoutes.get('/:id',   ctrl.getById);
accountPlansRoutes.post('/',     ctrl.create);
accountPlansRoutes.put('/:id',   ctrl.update);
accountPlansRoutes.delete('/:id', ctrl.delete);

export default accountPlansRoutes;
