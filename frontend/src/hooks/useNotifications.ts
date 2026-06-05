import { useState, useEffect, useCallback } from 'react';
import { notificationsService, type Notification } from '../services/notifications.service';
import { useAuthContext } from '../modules/Auth/context/AuthContext';

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const { isAuthenticated } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationsService.list();
      setNotifications(data);
    } catch {
      // falha silenciosa para não poluir a UI com erros de polling
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    fetch().finally(() => setLoading(false));

    const interval = setInterval(fetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetch]);

  const markRead = useCallback(async (id: string) => {
    await notificationsService.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const deleteOne = useCallback(async (id: string) => {
    await notificationsService.deleteOne(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, loading, markRead, markAllRead, deleteOne, refetch: fetch };
}
