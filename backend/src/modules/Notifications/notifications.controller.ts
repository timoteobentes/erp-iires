import type { Request, Response } from 'express';
import prisma from '../../config/prisma.js';

export class NotificationsController {

  // GET /notifications — lista as notificações do usuário autenticado + globais
  async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const notifications = await prisma.notification.findMany({
        where: {
          OR: [
            { userId },
            { userId: null },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      res.json({ notifications });
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // PATCH /notifications/read-all — marca todas como lidas
  async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: {
          OR: [{ userId }, { userId: null }],
          isRead: false,
        },
        data: { isRead: true },
      });

      res.json({ message: 'Todas as notificações foram marcadas como lidas.' });
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // PATCH /notifications/:id/read — marca uma como lida
  async markRead(req: Request, res: Response): Promise<void> {
    try {
      const id     = req.params['id'] as string;
      const userId = req.user!.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          OR: [{ userId }, { userId: null }],
        },
      });

      if (!notification) {
        res.status(404).json({ error: 'Notificação não encontrada.' });
        return;
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      res.json({ notification: updated });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // DELETE /notifications/:id — remove uma notificação
  async deleteOne(req: Request, res: Response): Promise<void> {
    try {
      const id     = req.params['id'] as string;
      const userId = req.user!.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          OR: [{ userId }, { userId: null }],
        },
      });

      if (!notification) {
        res.status(404).json({ error: 'Notificação não encontrada.' });
        return;
      }

      await prisma.notification.delete({ where: { id } });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  // POST /notifications — cria uma notificação (uso interno/admin)
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, type, userId, link } = req.body;

      if (!title || !description) {
        res.status(400).json({ error: 'title e description são obrigatórios.' });
        return;
      }

      // string vazia ou undefined → null (notificação global)
      const resolvedUserId = userId && typeof userId === 'string' && userId.trim() !== ''
        ? userId.trim()
        : null;

      if (resolvedUserId) {
        const userExists = await prisma.user.findUnique({ where: { id: resolvedUserId } });
        if (!userExists) {
          res.status(400).json({ error: 'Usuário não encontrado.' });
          return;
        }
      }

      const notification = await prisma.notification.create({
        data: {
          title,
          description,
          type: type ?? 'info',
          userId: resolvedUserId,
          link: link ?? null,
        },
      });

      res.status(201).json({ notification });
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}
