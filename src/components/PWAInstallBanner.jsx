// PWAInstallBanner — calm install prompt that appears above the BottomNav
// when the browser fires beforeinstallprompt. Theme-reactive; CSS vars only.

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Stack, Text, Button } from '../design-system/components';
import { motion as M, radius, z } from '../design-system/tokens';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallBanner() {
  const { canInstall, promptInstall, dismiss } = usePWAInstall();
  // Wave 4.3 P0 #7: respect prefers-reduced-motion. Framer's JS animation
  // loop ignores the CSS transition override; this is the sanctioned gate.
  const prefersReduced = useReducedMotion();
  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={prefersReduced ? false : { y: 80, opacity: 0 }}
          animate={prefersReduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { y: 80, opacity: 0 }}
          transition={prefersReduced ? { duration: 0 } : M.spring}
          role="region"
          aria-label="Install HDW"
          style={{
            position: 'fixed',
            left: 12,
            right: 12,
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            borderRadius: radius.lg,
            padding: 16,
            boxShadow: 'var(--shadow-2)',
            zIndex: z.toast,
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Stack direction="column" gap={3}>
            <Stack direction="column" gap={1}>
              <Text
                as="div"
                variant="mono-sm"
                tone="tertiary"
                style={{ textTransform: 'uppercase' }}
              >
                Install
              </Text>
              <Text as="div" variant="body-md" tone="primary">
                Add HDW to your home screen. Works offline, opens full-screen.
              </Text>
            </Stack>
            <Stack direction="row" gap={2} justify="flex-end">
              <Button onClick={dismiss} variant="bare" size="sm">
                Not now
              </Button>
              <Button onClick={promptInstall} variant="primary" accent="rust" size="sm">
                Install
              </Button>
            </Stack>
          </Stack>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
