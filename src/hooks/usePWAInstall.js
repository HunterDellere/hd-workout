import { useEffect, useState, useCallback } from 'react';

const DISMISS_KEY = 'apex.pwa.installDismissedAt';
const DISMISS_WINDOW_DAYS = 7;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia?.('(display-mode: standalone)').matches === true,
  );

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      const dismissedRecently = dismissedAt
        && Date.now() - dismissedAt < DISMISS_WINDOW_DAYS * 24 * 60 * 60 * 1000;
      setCanInstall(!dismissedRecently);
    };
    const onInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    if (choice?.outcome !== 'accepted') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    return choice?.outcome ?? null;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setCanInstall(false);
  }, []);

  return { canInstall, installed, promptInstall, dismiss };
}
