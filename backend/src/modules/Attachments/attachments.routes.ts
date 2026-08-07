import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { AttachmentsController } from './attachments.controller.js';
import { requestUploadSchema, confirmUploadSchema } from './attachments.schemas.js';

const routes = Router();
const controller = new AttachmentsController();

routes.use(authMiddleware);

routes.get('/', controller.list);
routes.post('/upload-url', validate(requestUploadSchema), controller.requestUpload);
routes.post('/', validate(confirmUploadSchema), controller.confirm);
routes.get('/:id/download-url', controller.getDownloadUrl);
routes.delete('/:id', controller.remove);

export default routes;
