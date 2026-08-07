import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../core/prisma/tenant-client.js';
import { getContext } from '../../core/context/request-context.js';
import { respondError } from '../../shared/utils/respond-error.js';
import { buildStorageKey, getUploadUrl, getDownloadUrl, deleteObject, objectExists } from '../../shared/services/storage.service.js';

export class AttachmentsController {
  // POST /attachments/upload-url — gera uma URL assinada para o front enviar o arquivo direto ao Storage
  async requestUpload(req: Request, res: Response): Promise<void> {
    try {
      const { fileName, mimeType, category } = req.body;
      const { organizationId } = getContext();

      const storageKey = buildStorageKey(organizationId, category || 'geral', fileName);
      const uploadUrl = await getUploadUrl(storageKey, mimeType);

      res.status(200).json({ uploadUrl, storageKey });
    } catch (error) {
      respondError(res, error, 'Erro ao preparar envio do arquivo.');
    }
  }

  // POST /attachments — confirma que o upload direto ao Storage funcionou e grava os metadados
  async confirm(req: Request, res: Response): Promise<void> {
    try {
      const { storageKey, fileName, mimeType, sizeBytes, category, transactionId, personId, memberId, projectId } = req.body;
      const { organizationId } = getContext();

      if (!(await objectExists(storageKey))) {
        res.status(422).json({ error: 'O arquivo não chegou ao Storage. Tente enviar novamente.' });
        return;
      }

      const attachment = await prisma.attachment.create({
        data: {
          fileName, mimeType, sizeBytes, storageKey, category: category || null,
          transactionId: transactionId || null,
          personId: personId || null,
          memberId: memberId || null,
          projectId: projectId || null,
          uploadedById: req.user!.id,
        } as any, // organizationId é injetado automaticamente pelo tenantPrisma
      });

      await prisma.organization.update({
        where: { id: organizationId },
        data: { storageUsedBytes: { increment: sizeBytes } },
      });

      res.status(201).json({ message: 'Anexo salvo com sucesso!', attachment });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Este arquivo já foi registrado.' });
        return;
      }
      respondError(res, error, 'Erro ao registrar anexo.');
    }
  }

  // GET /attachments?transactionId=...|personId=...|memberId=...|projectId=...
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, personId, memberId, projectId } = req.query as Record<string, string>;
      const where: any = {};
      if (transactionId) where.transactionId = transactionId;
      if (personId) where.personId = personId;
      if (memberId) where.memberId = memberId;
      if (projectId) where.projectId = projectId;

      const attachments = await prisma.attachment.findMany({ where, orderBy: { createdAt: 'desc' } });
      res.status(200).json({ attachments });
    } catch (error) {
      respondError(res, error, 'Erro ao listar anexos.');
    }
  }

  // GET /attachments/:id/download-url
  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const attachment = await prisma.attachment.findUnique({ where: { id: req.params['id'] as string } });
      if (!attachment) {
        res.status(404).json({ error: 'Anexo não encontrado.' });
        return;
      }
      const url = await getDownloadUrl(attachment.storageKey);
      res.status(200).json({ url, fileName: attachment.fileName });
    } catch (error) {
      respondError(res, error, 'Erro ao gerar link de download.');
    }
  }

  // DELETE /attachments/:id
  async remove(req: Request, res: Response): Promise<void> {
    try {
      const attachment = await prisma.attachment.findUnique({ where: { id: req.params['id'] as string } });
      if (!attachment) {
        res.status(404).json({ error: 'Anexo não encontrado.' });
        return;
      }

      await deleteObject(attachment.storageKey);
      await prisma.attachment.delete({ where: { id: attachment.id } });
      await prisma.organization.update({
        where: { id: getContext().organizationId },
        data: { storageUsedBytes: { decrement: attachment.sizeBytes } },
      });

      res.status(200).json({ message: 'Anexo removido com sucesso.' });
    } catch (error) {
      respondError(res, error, 'Erro ao remover anexo.');
    }
  }
}
