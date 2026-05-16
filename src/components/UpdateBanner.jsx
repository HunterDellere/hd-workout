// UpdateBanner — surfaces when a new service worker is waiting to activate.
// Tap "Refresh" to skipWaiting + reload. Quiet otherwise. Bottom-left so
// it doesn't compete with the bottom nav or SessionBar.
//
// vite-plugin-pwa with registerType:'prompt' installs a new SW silently;
// without a user prompt the SW waits forever (good — no mid-session
// bundle swap). This component is the prompt.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { motion as motionTokens } from '../design-system/tokens';

export function UpdateBanner() {
  const [registration, setRegistration] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
    let cancelled = false;
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (cancelled || !reg) return;
      setRegistration(reg);
      if (reg.waiting) setNeedsRefresh(true);
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedsRefresh(true);
          }
        });
      });
    });
    return () => { cancelled = true; };
  }, []);

  function applyUpdate() {
    if (!registration?.waiting) {
      window.location.reload();
      return;
    }
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    // The plugin's SW listens for SKIP_WAITING; once activated, the new SW
    // takes control. Reload to pick up the new shell + chunks.
    const onControllerChange = () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
  }

  return (
    <AnimatePresence>
      {needsRefresh && (
        <motion.div
          role="status"
          aria-live="polite"
          data-testid="update-banner"
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={prefersReduced ? { duration: 0 } : motionTokens.base}
          style={{
            position: 'fixed',
            left: 16,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
            zIndex: 60,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: 'var(--surface-raised, var(--surface-page))',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-2)',
            maxWidth: 360,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}
          >
            New version
          </span>
          <button
            type="button"
            onClick={applyUpdate}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              padding: '4px 10px',
              border: '1px solid var(--border-strong)',
              borderRadius: 4,
            }}
          >
            Refresh
          </button>
          <button
            type="button"
            aria-label="Dismiss update notification"
            onClick={() => setNeedsRefresh(false)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              color: 'var(--text-tertiary)',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
