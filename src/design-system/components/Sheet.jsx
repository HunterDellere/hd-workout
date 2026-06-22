// Sheet — full-bleed bottom sheet shell.
// Theme-reactive frame on CSS vars (Session 10). Drag-to-dismiss + escape +
// scrim-tap-to-close + body-scroll-lock mechanics preserved.
//
// Close affordances (in order of discoverability):
//   1. 44×44 ✕ button top-right of the sheet header (always visible).
//   2. Tap-anywhere on the wide handle row (the 44px-tall band at the
//      top of the sheet) — both the visual handle and the surrounding
//      whitespace dismiss. Drag still works for muscle-memory.
//   3. Tap the scrim (the dark backdrop behind the sheet).
//   4. Escape key (desktop / hardware keyboards).
//   5. Drag the sheet downward past 140px or with downward velocity.
//
// Mobile context: thumb reach on a 6.7" phone barely covers the top of
// the screen, so the X is positioned at the top-right of the sheet (not
// the page) and the handle row is a full-width hitbox to make
// tap-to-close possible from anywhere along the top edge.

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
            {/* Header row: wide tap-to-close band carrying the drag
                handle, plus an explicit 44×44 ✕ close button anchored
                top-right. The grid keeps the handle centred regardless
                of the close button's width. */}
            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '52px 1fr 52px',
                alignItems: 'center',
                flexShrink: 0,
                background: 'var(--surface-page)',
              }}
            >
              {/* Left spacer for visual symmetry with the close button. */}
              <span aria-hidden style={{ minHeight: 44 }} />

              {/* Drag handle + tap-to-close band. Spans the full middle
                  column so the lifter can tap anywhere across the top
                  band of the sheet to dismiss — no need to hit the small
                  grabber line precisely. Drag still works for users who
                  expect the iOS-style pull-down. */}
              <button
                type="button"
                data-testid="sheet-close-handle"
                aria-label="Close"
                onClick={() => onClose?.()}
                style={{
                  all: 'unset',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 48,
                    height: 5,
                    borderRadius: 99,
                    background: 'var(--border-strong)',
                  }}
                />
              </button>

              {/* Explicit ✕ close button. 44×44 hit target, top-right of
                  the sheet (not the page) so thumb reach on tall phones
                  doesn't require a stretch. */}
              <button
                type="button"
                data-testid="sheet-close-x"
                aria-label="Close"
                onClick={() => onClose?.()}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  width: 44,
                  height: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  lineHeight: 1,
                  justifySelf: 'end',
                  marginRight: 8,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                ✕
              </button>
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
