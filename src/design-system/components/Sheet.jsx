// Sheet — full-bleed bottom sheet shell.
// Theme-reactive frame on CSS vars (Session 10). Drag-to-dismiss + escape +
// scrim-tap-to-close + body-scroll-lock mechanics preserved.

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { motion as M, radius, z } from '../tokens';

// Elements that can receive focus inside the dialog. Used by the focus
// trap to find the first/last tabbable on Tab / Shift+Tab.
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), '
  + 'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet({ open, onClose, children, ariaLabel = 'Detail' }) {
  const prefersReduced = useReducedMotion();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Remember what had focus so we can hand it back on close — without
    // this, dismissing the sheet drops focus to <body> and a keyboard
    // user has to re-traverse the page from the top.
    const trigger = document.activeElement;

    // Move focus into the dialog once it has mounted. The aside is
    // tabIndex={-1}, so focusing it is a safe landing point even when the
    // sheet has no focusable children yet.
    const focusTimer = window.setTimeout(() => {
      const node = dialogRef.current;
      if (!node) return;
      const first = node.querySelector(FOCUSABLE);
      (first ?? node).focus();
    }, 0);

    const onKey = (e) => {
      if (e.key === 'Escape') { onClose?.(); return; }
      if (e.key !== 'Tab') return;
      // Trap Tab / Shift+Tab so focus cannot leave the modal sheet onto
      // the (still-rendered) page behind the scrim.
      const node = dialogRef.current;
      if (!node) return;
      const focusable = Array.from(node.querySelectorAll(FOCUSABLE))
        .filter((el) => el.offsetParent !== null || el === node);
      if (focusable.length === 0) { e.preventDefault(); node.focus(); return; }
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === firstEl || active === node)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      // Restore focus to the control that opened the sheet.
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0 }}
            transition={prefersReduced ? { duration: 0 } : M.fast}
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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            tabIndex={-1}
            initial={prefersReduced ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { y: '100%' }}
            transition={prefersReduced ? { duration: 0 } : M.sheet}
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
