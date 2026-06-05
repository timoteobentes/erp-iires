import { Router } from 'express';
import { CostCentersController } from './cost-centers.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';

const costCentersRoutes = Router();
const ctrl = new CostCentersController();

costCentersRoutes.use(authMiddleware);

costCentersRoutes.get('/',       ctrl.list);
costCentersRoutes.get('/:id',    ctrl.getById);
costCentersRoutes.post('/',      ctrl.create);
costCentersRoutes.put('/:id',    ctrl.update);
costCentersRoutes.delete('/:id', ctrl.delete);

export default costCentersRoutes;
