import { api } from '../api/api';

export interface Notification {
  id: string;
  userId: string | null;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'error';
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export const notificationsService = {
  async list(): Promise<Notification[]> {
    const { data } = await api.get('/notifications');
    return data.notifications as Notification[];
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async deleteOne(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
