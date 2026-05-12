import { AnimatePresence, motion } from 'framer-motion';
import { Button, Icon, color, radius, shadow, motion as M, withAlpha, z } from '../design-system';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallBanner() {
  const { canInstall, promptInstall, dismiss } = usePWAInstall();
  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={M.spring}
          role="region"
          aria-label="Install APEX"
          style={{
            position: 'fixed',
            left: 12,
            right: 12,
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            background: color.s1,
            border: `1px solid ${color.border2}`,
            borderRadius: radius.lg,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: shadow.s3,
            zIndex: z.toast,
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <span style={{
            width: 36,
            height: 36,
            background: withAlpha(color.push, 0.16),
            color: color.push,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            flexShrink: 0,
          }}>
            <Icon name="Download" size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: color.push,
              textTransform: 'uppercase',
            }}>
              Install APEX
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: color.text,
              marginTop: 2,
            }}>
              Add to home screen — works offline, full-screen training reference.
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={dismiss} accent={color.muted}>Not now</Button>
          <Button size="sm" variant="solid" onClick={promptInstall} accent={color.push}>Install</Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
