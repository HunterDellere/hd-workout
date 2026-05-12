import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { color, radius, shadow, motion as M, z } from '../tokens';

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
              background: 'rgba(0,0,0,0.62)',
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
              background: color.s1,
              borderTop: `1px solid ${color.border}`,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              boxShadow: shadow.s4,
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
                  background: color.border2,
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
