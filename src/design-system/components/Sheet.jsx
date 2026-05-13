// Sheet — full-bleed bottom sheet shell.
// Theme-reactive frame on CSS vars (Session 10). Drag-to-dismiss + escape +
// scrim-tap-to-close + body-scroll-lock mechanics preserved.

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { motion as M, radius, z } from '../tokens';

export function Sheet({ open, onClose, children, ariaLabel = 'Detail' }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={M.fast}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--surface-scrim)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: z.sheet,
            }}
          />
          <motion.aside
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={M.sheet}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 140 || info.velocity.y > 600) onClose?.();
            }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: '92vh',
              background: 'var(--surface-page)',
              borderTop: '1px solid var(--border-hairline)',
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              boxShadow: 'var(--shadow-2)',
              zIndex: z.sheet + 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              aria-hidden
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '10px 0 4px',
                cursor: 'grab',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 4,
                  borderRadius: 99,
                  background: 'var(--border-strong)',
                }}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
