import { motion } from 'framer-motion';
import { color, radius, motion as M, withAlpha } from '../design-system';

export function SectionPill({ children, active, accent, onClick, mandatory }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={M.fast}
      style={{
        position: 'relative',
        flexShrink: 0,
        padding: '8px 12px',
        background: active ? withAlpha(accent, 0.16) : color.s2,
        color: active ? accent : color.muted,
        border: `1px solid ${active ? withAlpha(accent, 0.5) : color.border}`,
        borderRadius: radius.pill,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {mandatory && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: active ? accent : color.warn,
          }}
        />
      )}
      {children}
    </motion.button>
  );
}
