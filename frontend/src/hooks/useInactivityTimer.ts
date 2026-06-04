import { useEffect, useRef, useCallback } from 'react';
import { notification } from 'antd';

export const SESSION_TIMEOUT_KEY = '@iires:sessionTimeout';
const DEFAULT_MINUTES = 30;
const WARN_BEFORE_MS = 60_000;
const EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'] as const;

export function useInactivityTimer(onTimeout: () => void) {
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref para sempre chamar a versão mais recente do callback sem recriar o efeito
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    notification.destroy('inactivity-warning');
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();

    const storedMinutes = parseInt(localStorage.getItem(SESSION_TIMEOUT_KEY) || String(DEFAULT_MINUTES), 10);
    const totalMs = storedMinutes * 60_000;

    if (totalMs > WARN_BEFORE_MS) {
      warnTimerRef.current = setTimeout(() => {
        notification.warning({
          key: 'inactivity-warning',
          message: 'Sessão prestes a expirar',
          description: 'Você será desconectado em 1 minuto por inatividade. Mova o mouse ou pressione uma tecla para continuar.',
          duration: 0,
        });
      }, totalMs - WARN_BEFORE_MS);
    }

    logoutTimerRef.current = setTimeout(() => {
      notification.destroy('inactivity-warning');
      onTimeoutRef.current();
    }, totalMs);
  }, [clearTimers]);

  useEffect(() => {
    resetTimer();
    EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      clearTimers();
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer, clearTimers]);
}
