import { Router } from 'express';
import { authMiddleware, requirePermission } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { InvitesController } from './invites.controller.js';
import { createInviteSchema, acceptInviteSchema } from './invites.schemas.js';
import { PERMISSIONS } from '@sigetes/shared';

const routes = Router();
const controller = new InvitesController();
const canManage = requirePermission(PERMISSIONS.ORG_MEMBERS_MANAGE);

// Rotas PÚBLICAS (fazem parte do fluxo de quem ainda não está logado)
routes.get('/by-token/:token', controller.preview);
routes.post('/accept', validate(acceptInviteSchema), controller.accept);

// Rotas PRIVADAS (gestão de convites dentro da organização)
routes.use(authMiddleware);
routes.get('/', controller.list);
routes.post('/', canManage, validate(createInviteSchema), controller.create);
routes.delete('/:id', canManage, controller.revoke);

export default routes;
