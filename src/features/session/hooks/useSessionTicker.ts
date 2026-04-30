import { useEffect } from 'react';
import { useSessionStore } from '../store/sessionStore';

export function useSessionTicker(intervalMs: number = 250): void {
  const activeSession = useSessionStore((state) => state.activeSession);
  const refreshSnapshot = useSessionStore((state) => state.refreshSnapshot);

  useEffect(() => {
    if (!activeSession) {
      return undefined;
    }

    refreshSnapshot();

    const timerId = globalThis.setInterval(() => {
      refreshSnapshot();
    }, intervalMs);

    return () => {
      globalThis.clearInterval(timerId);
    };
  }, [activeSession, intervalMs, refreshSnapshot]);
}
